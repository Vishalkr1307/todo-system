const { body, validationResult } = require("express-validator");

const formatOfError = (formatOfArray) => {
  return formatOfArray.map((err) => {
    return err.msg;
  });
};

const nameChain = () =>
  body("name").notEmpty().withMessage("Name is required").isString();
const emailChain = () =>
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("it must be email")
    .custom(async (val) => {
      const user = await User.findOne({ email: val }).lean().exec();
      if (user) {
        throw new Error("Email is already in use");
      }
    });
const loginEmailChain = () =>
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("it must be email")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });

      if (!user) {
        throw new Error("User not found");
      }
      req.user = user;
    });
const passwordChain = () =>
  body("password")
    .notEmpty()
    .isLength({ min: 5 })
    .withMessage("password must be at least 5 characters");
const otpSchema = () =>
  body("otp")
    .notEmpty()
    .isLength({ min: 4, max: 4 })
    .withMessage("otp must be have 4 characters");

const titleChain=()=>body("title").notEmpty().isString().withMessage("title must be a string")
const descriptionChain=()=>body("description").notEmpty().isString().withMessage("description must be a string")
const taskstatusChain=()=>body("tasks_status").notEmpty().isString().withMessage("tasks_status must be a string")


module.exports ={formatOfError,nameChain,emailChain,loginEmailChain,passwordChain,otpSchema,titleChain,descriptionChain,taskstatusChain }
