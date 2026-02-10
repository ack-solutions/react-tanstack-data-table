const test = require('node:test');
const assert = require('node:assert/strict');

const { matchesCustomColumnFilters } = require('../dist/lib/features/column-filter.feature.js');

function createMockRow(original, columnTypes = {}) {
    const cells = Object.keys(original).map((key) => ({
        column: {
            id: key,
            columnDef: {
                type: columnTypes[key],
            },
        },
        getValue: () => original[key],
    }));

    return {
        original,
        getAllCells: () => cells,
    };
}

test('supports equals and notEquals operators for text and number columns', () => {
    const row = createMockRow(
        { name: 'Alice', salary: 1000 },
        { name: 'text', salary: 'number' },
    );

    assert.equal(
        matchesCustomColumnFilters(row, [
            { id: '1', columnId: 'name', operator: 'equals', value: 'Alice', columnType: 'text' },
        ]),
        true,
    );

    assert.equal(
        matchesCustomColumnFilters(row, [
            { id: '2', columnId: 'name', operator: 'notEquals', value: 'Bob', columnType: 'text' },
        ]),
        true,
    );

    assert.equal(
        matchesCustomColumnFilters(row, [
            { id: '3', columnId: 'salary', operator: 'equals', value: 1000, columnType: 'number' },
        ]),
        true,
    );
});

test('supports notIn for both array and single-value filters', () => {
    const engineeringRow = createMockRow(
        { department: 'Engineering' },
        { department: 'select' },
    );
    const salesRow = createMockRow(
        { department: 'Sales' },
        { department: 'select' },
    );

    assert.equal(
        matchesCustomColumnFilters(engineeringRow, [
            { id: '4', columnId: 'department', operator: 'notIn', value: ['Sales'], columnType: 'select' },
        ]),
        true,
    );

    assert.equal(
        matchesCustomColumnFilters(engineeringRow, [
            { id: '5', columnId: 'department', operator: 'notIn', value: 'Sales', columnType: 'select' },
        ]),
        true,
    );

    assert.equal(
        matchesCustomColumnFilters(salesRow, [
            { id: '6', columnId: 'department', operator: 'notIn', value: ['Sales'], columnType: 'select' },
        ]),
        false,
    );
});

test('supports date isEmpty/isNotEmpty without requiring filter date parsing', () => {
    const emptyDateRow = createMockRow(
        { joinDate: '' },
        { joinDate: 'date' },
    );
    const validDateRow = createMockRow(
        { joinDate: '2024-01-01' },
        { joinDate: 'date' },
    );

    assert.equal(
        matchesCustomColumnFilters(emptyDateRow, [
            { id: '7', columnId: 'joinDate', operator: 'isEmpty', value: '', columnType: 'date' },
        ]),
        true,
    );

    assert.equal(
        matchesCustomColumnFilters(validDateRow, [
            { id: '8', columnId: 'joinDate', operator: 'isNotEmpty', value: '', columnType: 'date' },
        ]),
        true,
    );
});
