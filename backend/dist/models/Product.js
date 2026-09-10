"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SpecificationSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    value: { type: String, required: true }
}, { _id: false });
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    hasCasePricing: { type: Boolean, default: false },
    casePrice: { type: Number, min: 0 },
    caseSalePrice: { type: Number, min: 0 },
    caseUnitsCount: { type: Number, default: 12, min: 1 },
    piecePrice: { type: Number, min: 0 },
    pieceSalePrice: { type: Number, min: 0 },
    hasColors: { type: Boolean, default: false },
    colors: [{ type: String }],
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    images: [{ type: String }],
    brand: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Brand', required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    specifications: [SpecificationSchema],
}, { timestamps: true });
// Indexes for faster search and filtering
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
exports.default = mongoose_1.default.model('Product', ProductSchema);
