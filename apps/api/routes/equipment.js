/**
 * @swagger
 * {
 *   "/api/v1/equipment": {
 *     "get": {
 *       "tags": [
 *         "Equipment"
 *       ],
 *       "summary": "List active equipment",
 *       "description": "Public list sorted by name. No search, filtering, or pagination parameters are implemented.",
 *       "security": [],
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
 *                       "$ref": "#/components/schemas/Equipment"
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
 *         "Equipment"
 *       ],
 *       "summary": "Create equipment",
 *       "description": "Admin only. Equipment names must be unique; available quantity must be a nonnegative integer.",
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
 *                     "$ref": "#/components/schemas/Equipment"
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
 *               "$ref": "#/components/schemas/EquipmentInput"
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "/api/v1/equipment/{id}": {
 *     "get": {
 *       "tags": [
 *         "Equipment"
 *       ],
 *       "summary": "Get equipment",
 *       "description": "Returns one active equipment record.",
 *       "security": [],
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
 *                     "$ref": "#/components/schemas/Equipment"
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
 *         "Equipment"
 *       ],
 *       "summary": "Update equipment",
 *       "description": "Admin only; updates supplied fields of active equipment.",
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
 *                     "$ref": "#/components/schemas/Equipment"
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
 *               "$ref": "#/components/schemas/EquipmentUpdate"
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
 *         "Equipment"
 *       ],
 *       "summary": "Delete equipment",
 *       "description": "Admin only; soft-deletes equipment by setting isActive to false. Rental history remains.",
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
const { getEquipmentList, getEquipment, createEquipment, updateEquipment, deleteEquipment } = require("../controllers/equipment");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.route("/").get(getEquipmentList).post(protect, authorize("admin"), createEquipment);
router.route("/:id").get(getEquipment).put(protect, authorize("admin"), updateEquipment).delete(protect, authorize("admin"), deleteEquipment);

module.exports = router;
