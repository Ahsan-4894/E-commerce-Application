import { body, check, validationResult, param } from "express-validator";

const validateHandler = (req, res, next) => {
  const errors = validationResult(req);
  const errorMessages = errors
    .array()
    .map((e) => e.msg)
    .join(", ");

  if (errors.isEmpty()) return next();
  return next(new Error(errorMessages));
};

//ADD MORE ROBUST VALIDATORS!!!!!

const loginValidator = () => [
  body("email", "Please enter an email").notEmpty(),
  body("password", "Please enter a password").isLength({ min: 6 }),
];

const addCategoryValidator = () => [
  body("name", "Please enter a category name").notEmpty(),
  body("slug", "Please enter a slug").notEmpty(),
  body("description", "Please enter a description").notEmpty(),
];

export { addCategoryValidator, loginValidator, validateHandler };
