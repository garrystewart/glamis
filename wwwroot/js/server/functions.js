function createTextFile(text, path) {
    var fso = new ActiveXObject('Scripting.FileSystemObject');
    try {
        fsoCreateTextFile();
        return true;
    } catch (error) {
        try {
            createFolderStructure(path);
            fsoCreateTextFile();
        } catch (error) {
            return false;
        }
    }
    function fsoCreateTextFile(){
        var file = fso.CreateTextFile(Server.MapPath(path), true);
        file.WriteLine(text);
        file.Close();
    }
}

function fileExists(path) {
    var fso = new ActiveXObject('Scripting.FileSystemObject');
    if (fso.FileExists(Server.MapPath(path))) {
        return true;
    } else {
        return false;
    }
}

function folderExists(path) {
    var fso = new ActiveXObject('Scripting.FileSystemObject');
    if (fso.FolderExists(Server.MapPath(path))) {
        return true;
    } else {
        return false;
    }
}

function createFolder(path) {
    var fso = new ActiveXObject('Scripting.FileSystemObject');
    try {
        fso.CreateFolder(Server.MapPath(path));
        return true;
    } catch (error) {
        return false;
    }
}

function createFolderStructure(path) {
    var arrFolders = path.split('/').clean('');
    if (arrFolders[arrFolders.length - 1].indexOf('.')) {
        arrFolders.clean(arrFolders[arrFolders.length - 1]);
    }
    var buildPath = '/';
    try {
        for (var i = 0; i < arrFolders.length; i++) {
            buildPath += arrFolders[i] + '/';
            if (!folderExists(buildPath)) {
                createFolder(buildPath);
            }
        }
        return true;
    } catch (error) {
        return false;
    }
}