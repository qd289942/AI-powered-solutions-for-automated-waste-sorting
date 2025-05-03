import {Client} from '@elastic/elasticsearch';
import DetectedObject from '../data/detected-object';
import {OperationSection} from '@prisma/client';

class DectectedObjectsModel {
    private client: Client;

    private readonly GARBAGE_OBJECTS_INDEX_NAME = 'detected_garbage';

    constructor(client: Client) {
        this.client = client;
    }

    public save(detectedObject: DetectedObject, detectionTimeMs: number, imgPath: string, trackingId: string, operationSection: OperationSection): void {
        this.client.index({
                index: this.GARBAGE_OBJECTS_INDEX_NAME,
                body: {
                    bounding_box: {
                        x: detectedObject.bbox[0],
                        y: detectedObject.bbox[1],
                        width: detectedObject.bbox[2],
                        height: detectedObject.bbox[3],
                    },
                    detection_class: detectedObject.predictionClass,
                    detection_timestamp: detectionTimeMs,
                    detection_certainty: detectedObject.predictionScore,
                    img_path: imgPath,
                    tracking_id : trackingId,
                    x_detection_threshold: operationSection.cameraXThreshold,
                    ai_id: operationSection.aiId,
                    operation_section_id: operationSection.operationSectionId,
                }
            }
        );
    }

    async page(page: number, perPage: number) {
        const from = (page - 1) * perPage;

        const res = await this.client.search({
            index: this.GARBAGE_OBJECTS_INDEX_NAME,
            body : {
                "size": 0,
                "aggs": {
                    "group_by_tracking_id": {
                        "terms": {
                            "field": "tracking_id",
                            "size": 10000,
                            "order": {
                                "first_detection.value": "desc"
                            }
                        },
                        "aggs": {
                            "first_detection": {
                                "min": {
                                    "field": "detection_timestamp"
                                }
                            },
                            "last_detection": {
                                "max": {
                                    "field": "detection_timestamp"
                                }
                            },
                            "average_detection_certainty": {
                                "avg": {
                                    "field": "detection_certainty"
                                }
                            },
                            "most_common_class": {
                                "terms": {
                                    "field": "detection_class",
                                    "size": 1,
                                    "order": {
                                        "_count": "desc"
                                    }
                                }
                            },
                            "pagination": {
                                "bucket_sort": {
                                    "sort": [
                                        {
                                            "first_detection": {
                                                "order": "desc"
                                            }
                                        }
                                    ],
                                    "from": from,
                                    "size": perPage
                                }
                            }
                        }
                    },
                    "object_count": {
                        "cardinality": {
                            "field": "tracking_id"
                        }
                    }
                }
            }
        });

        return {
            page: page,
            perPage: perPage,
            pageData: res.body.aggregations.group_by_tracking_id.buckets,
            count: res.body.aggregations.object_count.value
        };
    }

    async get(trackingId: string) {
        const res = await this.client.search({
            index: this.GARBAGE_OBJECTS_INDEX_NAME,
            body: {
                "size": 0,
                "query": {
                    "term": {
                        "tracking_id": {
                            "value": trackingId
                        }
                    }
                },
                "aggs": {
                    "group_by_tracking_id": {
                        "terms": {
                            "field": "tracking_id",
                            "size": 10000,
                            "order": {
                                "first_detection.value": "desc"
                            }
                        },
                        "aggs": {
                            "first_detection": {
                                "min": {
                                    "field": "detection_timestamp"
                                }
                            },
                            "last_detection": {
                                "max": {
                                    "field": "detection_timestamp"
                                }
                            },
                            "average_detection_certainty": {
                                "avg": {
                                    "field": "detection_certainty"
                                }
                            },
                            "most_common_class": {
                                "terms": {
                                    "field": "detection_class",
                                    "size": 1,
                                    "order": {
                                        "_count": "desc"
                                    }
                                }
                            },
                            "top_hits_docs": {
                                "top_hits": {
                                    "from": 0,
                                    "size": 100
                                }
                            },
                            "pagination": {
                                "bucket_sort": {
                                    "sort": [
                                        {
                                            "first_detection": {
                                                "order": "desc"
                                            }
                                        }
                                    ],
                                    "from": 0,
                                    "size": 10
                                }
                            }
                        }
                    }
                }
            }
        });

        return res.body.aggregations.group_by_tracking_id.buckets[0];
    }
}

export default DectectedObjectsModel;
