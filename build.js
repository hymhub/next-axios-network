const fs = require('fs')
const path = require('path')
const { cwd } = require('process')

const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // 如果是子文件夹，递归删除
        deleteFolderRecursive(curPath);
      } else {
        // 如果是文件，直接删除
        fs.unlinkSync(curPath);
      }
    });
    // 删除空文件夹
    fs.rmdirSync(folderPath);
  }
}
const wwwPath = path.join(cwd(), 'server/www')
deleteFolderRecursive(wwwPath)
fs.renameSync(path.join(cwd(), 'client/dist'), wwwPath)