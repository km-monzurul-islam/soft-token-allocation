const Excel = require('exceljs');

async function readExcel(fileName){
    const rows = [];
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(fileName);
    const worksheet = workbook.getWorksheet('Soft Token');
    worksheet.eachRow((row, rowNumber) => {
        if(rowNumber !== 1)
            rows.push(row.values.slice(1));
    })
    return rows;
}

async function writeExcel(fileName, data){
    const newData = [...data];
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Soft Token');
    worksheet.columns = [
        { header: 'TASK/RITM', key: 'reqNumber', width: 12 },
        { header: 'Name', key: 'name', width: 16 },
        { header: 'User Scotia ID', key: 'scotiaID', width: 10 },
        { header: 'Email', key: 'email', width: 18 },
        { header: 'CC', key: 'cc', width: 18 },
        { header: 'Template', key: 'template', width: 12 },
        { header: 'OTRC', key: 'otrc', width: 16 },
    ]
    worksheet.addRows(data);
    await workbook.xlsx.writeFile(fileName);
}

module.exports = {
    readExcel,
    writeExcel,
};