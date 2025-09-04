// Advanced Logistics Calculations Module
// This module provides precise calculations for shipping and logistics

class LogisticsCalculator {
    constructor() {
        // Container specifications (40' HC)
        this.containerSpecs = {
            maxWeight: 26000, // kg
            maxVolume: 67.5, // m³
            dimensions: {
                length: 12.032, // m
                width: 2.352, // m
                height: 2.698 // m
            }
        };
        
        // Material density data (kg/m³)
        this.materialDensities = {
            'pine': {
                base: 450,
                moisture: 0.12, // 12% moisture content
                variation: 0.1 // ±10% variation
            },
            'combi': {
                base: 480,
                moisture: 0.12,
                variation: 0.1
            },
            'combi e': {
                base: 490,
                moisture: 0.12,
                variation: 0.1
            },
            'euca': {
                base: 520,
                moisture: 0.12,
                variation: 0.1
            }
        };
        
        // Grade quality factors affecting weight
        this.gradeFactors = {
            'C+/C': 1.0,
            'CP/C': 1.02,
            'BCX': 1.05,
            'C/C': 0.98,
            'CCX': 1.0,
            'CDX': 0.95,
            'falldown': 0.92,
            'shop grade': 0.90
        };
        
        // Thickness adjustment factors
        this.thicknessFactors = {
            6: 0.85,
            9: 0.90,
            12: 0.95,
            15: 1.0,
            18: 1.0,
            21: 1.05,
            24: 1.08,
            30: 1.12
        };
    }
    
    // Calculate precise weight per m³
    calculateWeight(product) {
        const material = this.materialDensities[product.Logs];
        if (!material) return 450; // Default fallback
        
        let weight = material.base;
        
        // Apply grade factor
        const gradeFactor = this.gradeFactors[product.Grade] || 1.0;
        weight *= gradeFactor;
        
        // Apply thickness factor
        const thicknessFactor = this.thicknessFactors[product.Thickness] || 1.0;
        weight *= thicknessFactor;
        
        // Apply layer factor (more layers = slightly denser)
        const layerFactor = 1 + ((product.Ply - 7) * 0.02);
        weight *= layerFactor;
        
        return Math.round(weight);
    }
    
    // Calculate volume per sheet
    calculateSheetVolume(product) {
        const [width, height] = product.Size.split('x').map(Number);
        return (width * height * product.Thickness) / 1000000000; // Convert to m³
    }
    
    // Calculate sheets per crate (industry standard estimates)
    calculateSheetsPerCrate(product) {
        const sheetVolume = this.calculateSheetVolume(product);
        const thickness = product.Thickness;
        
        // Standard crate volume varies by thickness
        let crateVolume;
        if (thickness <= 12) {
            crateVolume = 2.8; // m³
        } else if (thickness <= 18) {
            crateVolume = 2.5; // m³
        } else if (thickness <= 24) {
            crateVolume = 2.2; // m³
        } else {
            crateVolume = 2.0; // m³
        }
        
        return Math.floor(crateVolume / sheetVolume);
    }
    
    // Calculate container loading capacity
    calculateContainerCapacity(product) {
        const weightPerM3 = this.calculateWeight(product);
        const sheetVolume = this.calculateSheetVolume(product);
        const sheetsPerCrate = this.calculateSheetsPerCrate(product);
        
        // Weight-limited capacity
        const maxWeightCapacity = Math.floor(this.containerSpecs.maxWeight / weightPerM3);
        
        // Volume-limited capacity
        const maxVolumeCapacity = Math.floor(this.containerSpecs.maxVolume / sheetVolume);
        
        // Practical capacity (considering stacking and handling)
        const practicalCapacity = Math.min(maxWeightCapacity, maxVolumeCapacity) * 0.85;
        
        // Calculate crates that fit
        const crateVolume = sheetsPerCrate * sheetVolume;
        const maxCrates = Math.floor(this.containerSpecs.maxVolume / crateVolume);
        
        return {
            maxWeightCapacity: maxWeightCapacity,
            maxVolumeCapacity: maxVolumeCapacity,
            practicalCapacity: Math.floor(practicalCapacity),
            maxCrates: maxCrates,
            sheetsPerCrate: sheetsPerCrate,
            weightPerM3: weightPerM3,
            sheetVolume: sheetVolume,
            crateVolume: crateVolume
        };
    }
    
    // Calculate shipping costs estimate (basic framework)
    calculateShippingEstimate(product, destination = 'europe') {
        const capacity = this.calculateContainerCapacity(product);
        
        // Base shipping rates (USD per container)
        const shippingRates = {
            'europe': 2800,
            'north_america': 3200,
            'asia': 2400
        };
        
        const baseRate = shippingRates[destination] || shippingRates['europe'];
        
        // Additional costs
        const additionalCosts = {
            documentation: 150,
            handling: 200,
            insurance: baseRate * 0.02,
            localCharges: 300
        };
        
        const totalShippingCost = baseRate + Object.values(additionalCosts).reduce((a, b) => a + b, 0);
        const costPerM3 = totalShippingCost / capacity.practicalCapacity;
        
        return {
            containerCost: totalShippingCost,
            costPerM3: Math.round(costPerM3),
            breakdown: {
                shipping: baseRate,
                ...additionalCosts
            }
        };
    }
    
    // Calculate total landed cost
    calculateLandedCost(product, quantity, destination = 'europe') {
        const productPrice = product.Price;
        const shipping = this.calculateShippingEstimate(product, destination);
        const capacity = this.calculateContainerCapacity(product);
        
        // Calculate how many containers needed
        const containersNeeded = Math.ceil(quantity / capacity.practicalCapacity);
        
        const totalProductCost = quantity * productPrice;
        const totalShippingCost = containersNeeded * shipping.containerCost;
        const totalCost = totalProductCost + totalShippingCost;
        
        return {
            productCost: totalProductCost,
            shippingCost: totalShippingCost,
            totalCost: totalCost,
            costPerM3: Math.round(totalCost / quantity),
            containersNeeded: containersNeeded,
            efficiency: (quantity / (containersNeeded * capacity.practicalCapacity)) * 100
        };
    }
    
    // Generate logistics summary for product details
    generateLogisticsSummary(product) {
        const capacity = this.calculateContainerCapacity(product);
        const shippingEurope = this.calculateShippingEstimate(product, 'europe');
        const shippingNA = this.calculateShippingEstimate(product, 'north_america');
        
        return {
            weight: {
                perM3: capacity.weightPerM3,
                perSheet: Math.round(capacity.sheetVolume * capacity.weightPerM3),
                perCrate: Math.round(capacity.crateVolume * capacity.weightPerM3)
            },
            volume: {
                perSheet: capacity.sheetVolume,
                perCrate: capacity.crateVolume,
                sheetsPerCrate: capacity.sheetsPerCrate
            },
            container: {
                maxCapacityWeight: capacity.maxWeightCapacity,
                maxCapacityVolume: capacity.maxVolumeCapacity,
                practicalCapacity: capacity.practicalCapacity,
                maxCrates: capacity.maxCrates,
                utilizationFactor: 0.85
            },
            shipping: {
                europe: {
                    costPerContainer: shippingEurope.containerCost,
                    costPerM3: shippingEurope.costPerM3
                },
                northAmerica: {
                    costPerContainer: shippingNA.containerCost,
                    costPerM3: shippingNA.costPerM3
                }
            }
        };
    }
    
    // Format logistics data for display
    formatForDisplay(summary) {
        return {
            weight: `${summary.weight.perM3} kg/m³`,
            sheetWeight: `${summary.weight.perSheet} kg/sheet`,
            crateWeight: `${summary.weight.perCrate} kg/crate`,
            sheetVolume: `${(summary.volume.perSheet * 1000).toFixed(1)} L/sheet`,
            sheetsPerCrate: `${summary.volume.sheetsPerCrate} sheets/crate`,
            containerCapacity: `${summary.container.practicalCapacity} m³ (practical)`,
            maxCrates: `${summary.container.maxCrates} crates max`,
            shippingEurope: `$${summary.shipping.europe.costPerM3}/m³`,
            shippingNA: `$${summary.shipping.northAmerica.costPerM3}/m³`
        };
    }
}

// Export for use in main script
window.LogisticsCalculator = LogisticsCalculator;

