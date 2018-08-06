function createTextFile(path, text) {
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

    function fsoCreateTextFile() {
        var file = fso.CreateTextFile(Server.MapPath(path), true);
        file.WriteLine(text);
        file.Close();
    }
}

function openTextFile(path, text) {
    var fso = new ActiveXObject('Scripting.FileSystemObject');
    if (text) {
        try {
            fsoOpenTextFile();
            return true;
        } catch (error) {
            createFolderStructure(path);
            fsoOpenTextFile();
        }

        function fsoOpenTextFile() {
            var file = fso.OpenTextFile(Server.MapPath(path), 2, true);
            file.WriteLine(text);
            file.Close();
        }
    } else {
        if (fileExists(path)) {
            var file = fso.OpenTextFile(Server.MapPath(path), 1);
            var fileContents = file.ReadAll();
            file.Close();
            return fileContents;
        } else {
            return false;
        }
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

function httpResponse(code, customResponse) {
    var codes = {
        '100': 'Continue',
        '101': 'Switching Protocols',
        '102': 'Processing',
        '103': 'Early Hints',
        '200': 'OK',
        '201': 'Created',
        '202': 'Accepted',
        '203': 'Non-Authoritative Information',
        '204': 'No Content',
        '205': 'Reset Content',
        '206': 'Partial Content',
        '207': 'Multi-Status',
        '208': 'Already Reported',
        '226': 'IM Used',
        '300': 'Multiple Choices',
        '301': 'Moved Permanently',
        '302': 'Found',
        '303': 'See Other',
        '304': 'Not Modified',
        '305': 'Use Proxy',
        '306': 'Switch Proxy',
        '307': 'Temporary Redirect',
        '308': 'Permanent Redirect',
        '400': 'Bad Request',
        '401': 'Unauthorised',
        '402': 'Payment Required',
        '403': 'Forbidden',
        '404': 'Not Found',
        '405': 'Method Not Allowed',
        '406': 'Not Acceptable',
        '407': 'Proxy Authentication Required',
        '408': 'Request Timeout',
        '409': 'Conflict',
        '410': 'Gone',
        '411': 'Length Required',
        '412': 'Precondition Failed',
        '413': 'Payload Too Large',
        '414': 'URI Too Long',
        '415': 'Unsupported Media Type',
        '416': 'Range Not Satisfiable',
        '417': 'Expectation Failed',
        '418': 'I\'m a teapot',
        '421': 'Misdirected Request',
        '422': 'Unprocessable Entity',
        '423': 'Locked',
        '424': 'Failed Dependency',
        '426': 'Upgrade Required',
        '428': 'Precondition Required',
        '429': 'Too Many Requests',
        '431': 'Request Header Fields Too Large',
        '451': 'Unavailable For Legal Reasons',
        '500': 'Internal Server Error',
        '501': 'Not Implemented',
        '502': 'Bad Gateway',
        '503': 'Service Unavailable',
        '504': 'Gateway Timeout',
        '505': 'HTTP Version Not Supported',
        '506': 'Variant Also Negotiates',
        '507': 'Insufficient Storage',
        '508': 'Loop Detected',
        '510': 'Not Extended',
        '511': 'Network Authentication Required'
    };
    Response.Status = code + codes[code];
    if (String(code).substring(0, 1) === '2') {
        Response.Write(JSON.stringify(customResponse));
        Response.End;
    } else {
        var json = {};
        json.message = customResponse;
        json.code = code;
        json.phrase = codes[code];
        switch (String(code).substring(0, 1)) {
            case '1':
                json.type = 'Information'
                break;
            case '2':
                json.type = 'Success';
                break;
            case '3':
                json.type = 'Redirection';
                break;
            case '4':
                json.type = 'Client error';
                break;
            case '5':
                json.type = 'Server error';
                break;
        }
    }
    json.message = customResponse;
    Response.Write(JSON.stringify(json));
    Response.End;
}