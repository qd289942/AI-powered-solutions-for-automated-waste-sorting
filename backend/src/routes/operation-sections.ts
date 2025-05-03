import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response, Router } from "express";
import { logger } from "../util/logger";
import util from 'util'
import { checkAdmin } from "./middleware/authentication-middleware";

class InvalidActuatorCountException extends Error {

    constructor(message: string) {
        super(message);
        this.name = "InvalidActuatorCountException";
    }
}

export class OperationSectionRouter {

    private prisma: PrismaClient;
    public router: Router;

    constructor() {
        this.prisma = new PrismaClient()
        this.router = Router()
        this.addRoutes()
    }
    
    private addRoutes = () => {
        this.router.get('/', this.getAll);
        this.router.get('/:id', this.getById);
        this.router.post('/validate-name', this.validateName);
        this.router.post('/', checkAdmin, this.create);
        this.router.put('/', checkAdmin, this.update);
        this.router.delete('/:id', checkAdmin, this.delete);
    }

    private getAll = async (req: Request, res: Response) => {
        const { name } = req.query

        let operationSection;

        try {
            if(name != undefined) {
                operationSection = await this.prisma.operationSection.findUnique({
                    where: {
                        //@ts-ignore
                        name
                    },
                    include: {
                        actuators: {
                        },
                        ai: {}
                    }
                });
            } else {
                operationSection = await this.prisma.operationSection.findMany({
                    include: {
                        actuators: {},
                        ai: {}
                    }
                    
                });
                
            }

            return res.status(200).send(operationSection);
        } catch(e) {
            return res.status(400).end({error: "Invalid user input"})
        }
        

    }

    private getById = async (req: Request, res: Response) => {

        const id = + (req.params.id)

        if(isNaN(id) || id === undefined) {
            return res.status(400).send({error: "id must be a valid int"})
        }

        const operationSection = await this.prisma.operationSection.findUnique({ 
            where: {
                operationSectionId: id
            },
            include: {
                actuators: {},
                ai: {}
            }
        })



        if(!operationSection) {
            return res.status(400).send({error: `Operation Section with id: ${id} no found!`});
        } else {
            return res.status(200).send(operationSection);
        }

    }


    /*POST http://localhost:3000/operation-sections/ HTTP/1.1
    content-type: application/json

    {
    "name": "test1",
    "conveyerSpeed": 15.0,
    "aiId": "0",
    "actuators": [
        {
        "name": "Actuator1",
        "xThreshold": "50",
        "type": "COMPRESSED_AIR",
        "activationTrashLabel": [ "Metal" ]
        },
        {
        "name": "Actuator2",
        "xThreshold": "75",
        "type": "COMPRESSED_AIR",
        "activationTrashLabel": [ "Person" ]
        }
    ]
    }

    */
    private create = async (req: Request, res: Response) => {
        const { name, actuators } = req.body;
   
        
        // parse to number if passed as string
        const conveyerSpeed = + req.body.conveyerSpeed
        const aiId = + req.body.aiId
        const cameraXThreshold = + req.body.cameraXThreshold
        const detectionMinThreshold = + req.body.detectionMinThreshold
        const cameraPictureWidthMm = + req.body.cameraPictureWidthMm


        if(!actuators || !(actuators instanceof Array) || actuators.length == 0 ) {
            return res.status(400).send({error: `Invalid Actuators Array. Must be like: ${JSON.stringify(this.getActuatorsArrayExampel())}`});
        }
        
        try {

            const operationSectionCreate: Prisma.OperationSectionCreateWithoutAiInput =  {
                name,
                conveyerSpeed,
                cameraXThreshold,
                detectionMinThreshold,
                cameraPictureWidthMm,
                "actuators": {
                    create: actuators.map((actuator: Prisma.ActuatorCreateInput) => { 
                        return {
                            "name": actuator.name,
                            "cameraDistance": + actuator.cameraDistance,
                            "actuatorCalibration": actuator.actuatorCalibration === undefined ? undefined : + actuator.actuatorCalibration,
                            "type": actuator.type,
                            "activationTrashLabel": Array.isArray(actuator.activationTrashLabel) ? actuator.activationTrashLabel : [ actuator.activationTrashLabel ]
                        }
                    })
                }
            }
        
       
            const createdOpertionSection = await this.prisma.operationSection.create({
                data: {
                    ...operationSectionCreate,
                    ai: {
                        connect: {
                            aiId
                        }
                    }
                },
                include: {
                    actuators: {},
                    ai: {}
                }
                
            })

            return res.status(200).send(createdOpertionSection)

        } catch(e) {

            logger.info(`Create operation failed: ${util.inspect(e, {showHidden: false, depth: null})}`)
            
            if (e instanceof Prisma.PrismaClientValidationError) {

                return res.status(400).send({error: "Operation Section Name is already in use! Please use a different unique name."})
            
            } else if (e instanceof Prisma.PrismaClientKnownRequestError) {

                logger.info(`Create operation failed: ${JSON.stringify(e, null, 4)}`)

                if (e.code === 'P2002') {
                  return res.status(400).send({error: "Operation Section Name is already in use! Please use a different unique name."})
                }
            }

            return res.status(400).send({error: "invalid user input!"})

        }
    }

    private validateName = async (req: Request, res: Response) => {
        const { name, operationSectionId } = req.body;

        let wherePortion: {name: string, NOT ?: {operationSectionId: number}} = {
            name
        };

        if(operationSectionId) {
            wherePortion['NOT'] = {
                operationSectionId: operationSectionId
            };
        }

        this.prisma.operationSection.findUnique({
            where: wherePortion
        }).then((operationSection) => {
            if(operationSection) {
                return res.status(200).send({message: "Operation Section Name is already in use! Please use a different unique name.", available: false})
            } else {
                return res.status(200).send({message: "Operation Section Name is available!", available: true})
            }
        }).catch((e) => {
            return res.status(400).send({error: "invalid user input!"})
        });
    }


    private update = async (req: Request, res: Response) => {
        let { name, conveyerSpeed, aiId, actuators, operationSectionId, detectionMinThreshold, cameraPictureWidthMm } = req.body;

        if(!operationSectionId) {
            return res.status(400).send({error: "invalid operationSectionId passed"})
        }

        await this.prisma.$transaction( async (transaction) => {
            const operationSectionUpdate: Prisma.OperationSectionUpdateInput =  {
                name,
                conveyerSpeed,
                detectionMinThreshold,
                cameraPictureWidthMm
            }

            if(actuators != null && actuators != undefined && Array.isArray(actuators) && actuators.length > 0) {
                
                // check if we have to delete actuators
                const allActuators = await transaction.actuator.findMany({
                    where: {
                        operationSectionId
                    }
                });

                const toDelete = allActuators.filter(actuator => {
                    return !actuators.find(a => a.actuatorId === actuator.actuatorId)
                });

                logger.info(`deleting actuators ${JSON.stringify(toDelete)}`)
                await transaction.actuator.deleteMany({
                    where: {
                        actuatorId: {
                            in: toDelete.map(a => a.actuatorId)
                        }
                    }
                })

                const toUpdate = actuators.filter(actuator => {
                    return !isNaN(+actuator.actuatorId)
                } )

                logger.info(`updating actuators ${JSON.stringify(toUpdate)}`)

                // check if we have to create actuators
                let toCreate = actuators.filter(actuator => {
                    return isNaN(+actuator.actuatorId)
                })
                
                toUpdate.forEach(async actuator => {
                    const { actuatorId, ...other } = actuator;

                    await transaction.actuator.updateMany({
                        where: {
                            actuatorId: actuatorId
                        },
                        data: {
                            ...other
                        }
                    }).catch(e => {
                        logger.info(`update of actuator ${actuatorId} failed: ${JSON.stringify(e)}`)
                        
                    });    
                    
                })

                toCreate = toCreate.map((actuator: Prisma.ActuatorCreateInput) => { 
                    return {
                        "operationSectionId": operationSectionId,
                        "name": actuator.name,
                        "actuatorCalibration": actuator.actuatorCalibration,
                        "cameraDistance": + actuator.cameraDistance,
                        "type": actuator.type,
                        "activationTrashLabel": Array.isArray(actuator.activationTrashLabel) ? actuator.activationTrashLabel : [ actuator.activationTrashLabel ]
                    }
                })
                
                logger.info(`creating actuators ${JSON.stringify(toCreate)}`)
                await transaction.actuator.createMany({
                    data: [
                        ...toCreate
                    ]
                })

            }
        
            const actuatorsAfterUpdate = await transaction.actuator.findMany({
                where: {
                    operationSectionId
                }
            })
            
            if (actuatorsAfterUpdate.length === 0) {
                throw new InvalidActuatorCountException("At least one actuator must be present in the operation section!")
            }
        
            if(aiId) {

                await transaction.operationSection.update({
                    where: {
                        operationSectionId
                    },
                    data:  {
                        ...operationSectionUpdate,
                        ai: {
                            connect: {
                                aiId
                            }
                        }

                    }

                })

            } else {

                await transaction.operationSection.update({
                    where: {
                        operationSectionId
                    },
                    data:  {
                        ...operationSectionUpdate
                    }
                })

            }
            
            const udpatedValues = await transaction.operationSection.findUnique({
                where: {
                    operationSectionId
                },
                include: {
                    actuators: {},
                    ai: {},
                }

            })
            
            
            return res.status(200).send(udpatedValues)
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable}).catch(e => {

        
    

        logger.info(`Update operation failed: ${JSON.stringify(e)}`)

        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            
            if (e.code === 'P2002') {
                return res.status(400).send({error: "Operation Section Name is already in use! Please use a different unique name."})
            }
            
        } else if(e instanceof InvalidActuatorCountException) {
            return res.status(400).send({error: e.message})
        }
        
        return res.status(400).send({error: "invalid user input!"})
    });
    }

    private delete = async (req: Request, res: Response) => {

        let operationSectionId = + (req.params.id)

        logger.info(`got delete request for OperationId: ${operationSectionId}`)

        try {

                    
            const deletion = await this.prisma.operationSection.delete({
                where: {
                    operationSectionId
                }
            })

            logger.info(`Operation Section ${operationSectionId} sucessfully deleted!`);
            res.status(200).send(deletion);
        } catch(e) {
            logger.info(`Deletion of OperationId ${operationSectionId} failed!`);

            res.status(400).send(e)
        }
    }



    private getActuatorsArrayExampel = () => {
        return {
            "actuators": [
            {
            "name": "Actuator1",
            "xThreshold": "50",
            "type": "COMPRESSED_AIR",
            "activationTrashLabel": [ "Metal" ]
            },
            {
            "name": "Actuator2",
            "xThreshold": "75",
            "type": "COMPRESSED_AIR",
            "activationTrashLabel": [ "Person" ]
            }
        ] }
    }
}
