"use strict";

const { v4: uuidv4 } = require('uuid');

class ProductException {
    constructor(message) {
        this.name = "ProductException";
        this.message = message;
    }
}

class Product {
    constructor(title, description, imageUrl, unit, stock, pricePerUnit, category) {
        this._uuid = uuidv4();
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.unit = unit;
        this.stock = stock;
        this.pricePerUnit = pricePerUnit;
        this.category = category;
    }

    // Getters y Setters
    get uuid() { return this._uuid; }
    set uuid(value) { throw new ProductException("UUID es inmutable"); }

    get title() { return this._title; }
    set title(value) {
        if (typeof value !== "string" || value.trim() === "") throw new ProductException("Título inválido");
        this._title = value;
    }

    get description() { return this._description; }
    set description(value) {
        if (typeof value !== "string" || value.trim() === "") throw new ProductException("Descripción inválida");
        this._description = value;
    }

    get imageUrl() { return this._imageUrl; }
    set imageUrl(value) {
        if (typeof value !== "string" || !value.startsWith('http')) throw new ProductException("URL inválida");
        this._imageUrl = value;
    }

    get unit() { return this._unit; }
    set unit(value) {
        if (typeof value !== "string" || value.trim() === "") throw new ProductException("Unidad inválida");
        this._unit = value;
    }

    get stock() { return this._stock; }
    set stock(value) {
        if (typeof value !== "number" || value < 0) throw new ProductException("Stock inválido");
        this._stock = value;
    }

    get pricePerUnit() { return this._pricePerUnit; }
    set pricePerUnit(value) {
        if (typeof value !== "number" || value <= 0) throw new ProductException("Precio inválido");
        this._pricePerUnit = value;
    }

    get category() { return this._category; }
    set category(value) {
        if (typeof value !== "string" || value.trim() === "") throw new ProductException("Categoría inválida");
        this._category = value;
    }
}

module.exports = { Product, ProductException };
