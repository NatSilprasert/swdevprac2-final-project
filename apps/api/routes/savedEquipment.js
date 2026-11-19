/**
 * @swagger
 * {
 *   "/api/v1/saved-equipment": {
 *     "get": {
 *       "tags": ["Saved equipment"],
 *       "summary": "List the signed-in user's saved equipment",
 *       "description": "Returns active equipment saved by the authenticated account only.",
 *       "security": [{ "bearerAuth": [] }],
 *       "responses": {
 *         "200": {
 *           "description": "The authenticated user's saved equipment.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": { "type": "boolean" },
 *                   "count": { "type": "integer" },
 *                   "data": { "type": "array", "items": { "type": "object" } }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "401": { "$ref": "#/components/responses/Error401" }
 *       }
 *     }
 *   },
 *   "/api/v1/saved-equipment/{equipmentId}": {
 *     "post": {
 *       "tags": ["Saved equipment"],
 *       "summary": "Save equipment to the signed-in user's list",
 *       "security": [{ "bearerAuth": [] }],
 *       "parameters": [{ "in": "path", "name": "equipmentId", "required": true, "schema": { "type": "string" } }],
 *       "responses": {
 *         "200": { "description": "Equipment saved." },
 *         "400": { "$ref": "#/components/responses/Error400" },
 *         "401": { "$ref": "#/components/responses/Error401" },
 *         "404": { "$ref": "#/components/responses/Error404" }
 *       }
 *     },
 *     "delete": {
 *       "tags": ["Saved equipment"],
 *       "summary": "Remove equipment from the signed-in user's list",
 *       "security": [{ "bearerAuth": [] }],
 *       "parameters": [{ "in": "path", "name": "equipmentId", "required": true, "schema": { "type": "string" } }],
 *       "responses": {
 *         "200": { "description": "Equipment removed from the user's saved list." },
 *         "400": { "$ref": "#/components/responses/Error400" },
 *         "401": { "$ref": "#/components/responses/Error401" }
 *       }
 *     }
 *   }
 * }
 */
const express = require("express");
const {
  getSavedEquipment,
  saveEquipment,
  removeSavedEquipment,
} = require("../controllers/savedEquipment");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", getSavedEquipment);
router.post("/:equipmentId", saveEquipment);
router.delete("/:equipmentId", removeSavedEquipment);

module.exports = router;
