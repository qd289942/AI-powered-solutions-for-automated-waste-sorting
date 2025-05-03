/*
    JEST Testing for authentication
*/
import Auth from "../../src/routes/auth";
import { sign } from "../../src/routes/middleware/authentication-middleware";
import jwt from 'jsonwebtoken';
import { PUBLIC_KEY } from "../../src/secrets";
import AuthService from "../../src/service/auth-service";

test("scrypt of abc with salt salt", async () => {
        
        const hash = await AuthService.performScrypt('abc', 'salt');

        expect(hash).toStrictEqual("440ac811b32fea3ca86301f69294e241da4eba0259e8ac1017aa64a350837417bc0043b128e3eeb6d4584ed03a61c26df9e21be22c996629957efa1efe2242d6");
    }
);
  /*
test("scrypt of abc with salt salt", async () => {
       sign('abc').then((token) => {
            expect(token).toStrictEqual("");
       });
    }
);
*/

test("verify token", async () => {

        const token = await sign('abc');
        const decoded = jwt.verify(token, PUBLIC_KEY);
        console.log(token, decoded)
        expect(decoded).toStrictEqual("abc");

})
