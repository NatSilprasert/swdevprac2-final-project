/**
 * @swagger
 * {
 *   "/api/v1/rentals": {
 *     "get": {
 *       "tags": [
 *         "Rentals"
 *       ],
 *       "summary": "List rental requests",
 *       "description": "Members see their own requests; admins see all requests. Sorted by start date and creation time, with populated equipment and user details.",
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Successful operation.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean",
 *                     "example": true
 *                   },
 *                   "data": {
 *                     "type": "array",
 *                     "items": {
 *                       "$ref": "#/components/schemas/Rental"
 *                     }
 *                   },
 *                   "count": {
 *                     "type": "integer"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "$ref": "#/components/responses/Error400"
 *         },
 *         "401": {
 *           "$ref": "#/components/responses/Error401"
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/Error403"
 *         },
 *         "404": {
 *           "$ref": "#/components/responses/Error404"
 *         },
 *         "429": {
 *           "$ref": "#/components/responses/Error429"
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/Error500"
 *         }
 *       }
 *     },
 *     "post": {
 *       "tags": [
 *         "Rentals"
 *       ],
 *       "summary": "Create a rental request",
 *       "description": "Member only. Ownership comes from the authenticated user. Dates use YYYY-MM-DD and today in UTC. Start date cannot be in the past; return date cannot precede start date. Return date minus start date is at most 7 days; same-day rentals are allowed. Quantity is an integer from 1 to 3 and cannot exceed the active equipment quantity. Requests do not reserve or deduct inventory.",
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "responses": {
 *         "201": {
 *           "description": "Successful operation.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean",
 *                     "example": true
 *                   },
 *                   "data": {
 *                     "$ref": "#/components/schemas/Rental"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "$ref": "#/components/responses/Error400"
 *         },
 *         "401": {
 *           "$ref": "#/components/responses/Error401"
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/Error403"
 *         },
 *         "404": {
 *           "$ref": "#/components/responses/Error404"
 *         },
 *         "429": {
 *           "$ref": "#/components/responses/Error429"
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/Error500"
 *         }
 *       },
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/RentalInput"
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "/api/v1/rentals/{id}": {
 *     "get": {
 *       "tags": [
 *         "Rentals"
 *       ],
 *       "summary": "Get a rental request",
 *       "description": "Only the owner or admin can view this request. Includes equipment and user details.",
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Successful operation.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean",
 *                     "example": true
 *                   },
 *                   "data": {
 *                     "$ref": "#/components/schemas/Rental"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "$ref": "#/components/responses/Error400"
 *         },
 *         "401": {
 *           "$ref": "#/components/responses/Error401"
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/Error403"
 *         },
 *         "404": {
 *           "$ref": "#/components/responses/Error404"
 *         },
 *         "429": {
 *           "$ref": "#/components/responses/Error429"
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/Error500"
 *         }
 *       },
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
 *           "required": true,
 *           "schema": {
 *             "type": "string",
 *             "pattern": "^[a-fA-F0-9]{24}$",
 *             "example": "507f1f77bcf86cd799439011"
 *           }
 *         }
 *       ]
 *     },
 *     "put": {
 *       "tags": [
 *         "Rentals"
 *       ],
 *       "summary": "Update a rental request",
 *       "description": "Only the owner or admin can edit this request. Omitted fields retain existing values. Ownership cannot be changed. Dates use YYYY-MM-DD and today in UTC. Start date cannot be in the past; return date cannot precede start date. Return date minus start date is at most 7 days; same-day rentals are allowed. Quantity is an integer from 1 to 3 and cannot exceed the active equipment quantity. Requests do not reserve or deduct inventory.",
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Successful operation.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean",
 *                     "example": true
 *                   },
 *                   "data": {
 *                     "$ref": "#/components/schemas/Rental"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "$ref": "#/components/responses/Error400"
 *         },
 *         "401": {
 *           "$ref": "#/components/responses/Error401"
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/Error403"
 *         },
 *         "404": {
 *           "$ref": "#/components/responses/Error404"
 *         },
 *         "429": {
 *           "$ref": "#/components/responses/Error429"
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/Error500"
 *         }
 *       },
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/RentalUpdate"
 *             }
 *           }
 *         }
 *       },
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
 *           "required": true,
 *           "schema": {
 *             "type": "string",
 *             "pattern": "^[a-fA-F0-9]{24}$",
 *             "example": "507f1f77bcf86cd799439011"
 *           }
 *         }
 *       ]
 *     },
 *     "delete": {
 *       "tags": [
 *         "Rentals"
 *       ],
 *       "summary": "Delete a rental request",
 *       "description": "Only the owner or admin can permanently delete this request. Equipment quantity is unchanged.",
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Successful operation.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean",
 *                     "example": true
 *                   },
 *                   "data": {
 *                     "type": "object",
 *                     "example": {}
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "$ref": "#/components/responses/Error400"
 *         },
 *         "401": {
 *           "$ref": "#/components/responses/Error401"
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/Error403"
 *         },
 *         "404": {
 *           "$ref": "#/components/responses/Error404"
 *         },
 *         "429": {
 *           "$ref": "#/components/responses/Error429"
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/Error500"
 *         }
 *       },
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
 *           "required": true,
 *           "schema": {
 *             "type": "string",
 *             "pattern": "^[a-fA-F0-9]{24}$",
 *             "example": "507f1f77bcf86cd799439011"
 *           }
 *         }
 *       ]
 *     }
 *   }
 * }
 */
const express = require("express");
const { getRentals, getRental, createRental, updateRental, deleteRental } = require("../controllers/rentals");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.use(protect);
router.get("/", getRentals);
router.post("/", authorize("member"), createRental);
router.route("/:id").get(getRental).put(updateRental).delete(deleteRental);

module.exports = router;
