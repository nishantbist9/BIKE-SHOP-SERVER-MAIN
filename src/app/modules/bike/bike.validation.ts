import { z } from "zod";
import { BIKE_CATEGORY, TBikeCategory } from "./bike.interface";
const bikeValidationSchema = z.object({
  modelNumber: z.string({
    required_error: 'Model Number is required'
  }).min(1, 'Model Number cannot be empty')
    .refine(
      (value) => /^[a-zA-Z0-9-]+$/.test(value),
      { message: 'Model Number can only contain letters, numbers, and dashes' }
    ),
  name: z.string({
    required_error: 'Bike name is required'
  }).min(2, 'Bike name must be at least 2 characters')
    .max(50, "Bike name cannot exceed 50 characters")
    .refine(
      (value) => value.charAt(0) === value.charAt(0).toUpperCase(),
      { message: "Bike name must start with a capital letter" }
    ),
  brand: z.string().min(1, "Brand is required"),
  image: z.string().optional().default(""),
  // image: z.string({
  //   required_error: 'Image URL is required'
  // }).min(1, "Image URL cannot be empty"),

  // category: z.enum(["Mountain", "Road", "Hybrid", "Electric"], {
  // category: z.enum(Object.values(BIKE_CATEGORY) as [string, ...string[]], {
  category: z.enum(Object.values(BIKE_CATEGORY) as [TBikeCategory, ...TBikeCategory[]], {
    required_error: "Category is required",
    invalid_type_error: "Invalid category",
  }),
  price: z
    .number()
    .positive("Price must be a positive number")
    .min(0, "Price must be at least 0"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .nonnegative("Quantity must be a non-negative integer"),
  description: z.string().min(1, "Description is required"),
  inStock: z.boolean().optional().default(true),
  // createdAt: z.date().default(() => new Date()),
  // updatedAt: z.date().default(() => new Date()),
  isDeleted: z.boolean().optional(),
});
export default bikeValidationSchema;

