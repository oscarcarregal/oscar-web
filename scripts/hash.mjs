import bcrypt from "bcryptjs";
const hash = bcrypt.hashSync("jsB56y05u5vG", 10);
console.log("HASH:", hash);
