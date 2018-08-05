function writeJSON(json, path) {
    var fso = new ActiveXObject('Scripting.FileSystemObject');
    var file = fso.CreateTextFile(Server.MapPath(path), true);
    file.WriteLine(json);
    file.Close();
}