import React, { useState } from 'react';
import '../assets/styles/ResourcesPage.css'; // Assuming you have a CSS file for this page

const ResourcesPage = () => {
    const [selectedResource, setSelectedResource] = useState('Agriculture');
    const [cost, setCost] = useState({ base: 0, full: 0, margin: 0 });
    const [production, setProduction] = useState({ 
        node: 0, maxPerPerson: 0, minPerPerson: 0, cityProduction: 0 
    });
    const [producedFrom, setProducedFrom] = useState([
        { resource: 'Rubber', value: 500 },
        { resource: 'Coal', value: 1000 }
    ]);

    const handleResourceChange = (e) => {
        setSelectedResource(e.target.value);
    };

    const handleCostChange = (e) => {
        const { name, value } = e.target;
        setCost(prev => ({ ...prev, [name]: value }));
    };

    const handleProductionChange = (e) => {
        const { name, value } = e.target;
        setProduction(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="resources-page">
            <h2>Resources</h2>

            {/* Resource Group */}
            <div className="resource-group">
                <h3>Resources</h3>
                <div>
                    {['Agriculture', 'Rubber', 'Timber', 'Petroleum', 'Coal', 'Ore', 'Uranium', 'Electricity', 'Consumer Goods', 'Military Goods', 'Industrial Goods'].map((resource) => (
                        <label key={resource}>
                            <input
                                type="radio"
                                value={resource}
                                checked={selectedResource === resource}
                                onChange={handleResourceChange}
                            />
                            {resource}
                        </label>
                    ))}
                </div>
            </div>

            {/* Cost Group */}
            <div className="cost-group">
                <h3>Cost</h3>
                <label>Base Cost:</label>
                <input
                    type="number"
                    name="base"
                    value={cost.base}
                    onChange={handleCostChange}
                    min="0"
                    max="999999999"
                />
                <label>Full Cost:</label>
                <input
                    type="number"
                    name="full"
                    value={cost.full}
                    onChange={handleCostChange}
                    min="0"
                    max="999999999"
                />
                <label>Margin:</label>
                <input
                    type="number"
                    name="margin"
                    value={cost.margin}
                    onChange={handleCostChange}
                    min="0"
                    max="999999999"
                />
            </div>

            {/* Production Group */}
            <div className="production-group">
                <h3>Production</h3>
                <label>Node Production:</label>
                <input
                    type="number"
                    name="node"
                    value={production.node}
                    onChange={handleProductionChange}
                    min="0"
                    max="999999"
                />
                <label>Max Production Per Person:</label>
                <input
                    type="number"
                    name="maxPerPerson"
                    value={production.maxPerPerson}
                    onChange={handleProductionChange}
                    min="0"
                    max="999999"
                />
                <label>Min Production Per Person:</label>
                <input
                    type="number"
                    name="minPerPerson"
                    value={production.minPerPerson}
                    onChange={handleProductionChange}
                    min="0"
                    max="999999"
                />
                <label>City Production:</label>
                <input
                    type="number"
                    name="cityProduction"
                    value={production.cityProduction}
                    onChange={handleProductionChange}
                    min="0"
                    max="999999"
                />
            </div>

            {/* Produced From Group */}
            <div className="produced-from-group">
                <h3>Produced From</h3>
                <div className="produced-from-table-wrapper">
                    <table className="produced-from-table">
                        <thead>
                            <tr>
                                <th>Resource</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {producedFrom.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.resource}</td>
                                    <td>{item.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ResourcesPage;
