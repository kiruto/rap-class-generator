var $ClassGen = {};

// Customize:
$ClassGen.JSON_ANNOTATION = "@JSONDict(key = \"{{$key}}\"\r\n";
$ClassGen.IMPORT_CLASS = "me.chunyu.g7json.annotation.JSONDict";

// Use GSON:
//$ClassGen.JSON_ANNOTATION = "@SerializedName(\"{{$key}}\")\r\n";
//$ClassGen.IMPORT_CLASS = "com.google.gson.annotations.serializedname";

// Used for ios h & m file generation, we recommend that you do not modify the value of following attributions.
$ClassGen.annotations = {
    interfaceStart: "// -*-START OF A INTERFACE-*-",
    interfaceEnd: "// -*-END OF A INTERFACE-*-",
    implStart: "// -*-START OF A IMPL-*-",
    implEnd: "// -*-END OF A IMPL-*-"
};
$ClassGen.deleteAnnotations = function(string) {
    return string
        .replace(/\/\/ -\*-START OF A INTERFACE-\*-/g, "")
        .replace(/\/\/ -\*-END OF A INTERFACE-\*-/g, "")
        .replace(/\/\/ -\*-START OF A IMPL-\*-/g, "")
        .replace(/\/\/ -\*-END OF A IMPL-\*-/g, "");
};
$ClassGen.interfaceReg = /(\/\/ -\*-START OF A INTERFACE-\*-)[\d\D]*?(\/\/ -\*-END OF A INTERFACE-\*-)/g;
$ClassGen.implReg = /(\/\/ -\*-START OF A IMPL-\*-)[\d\D]*?(\/\/ -\*-END OF A IMPL-\*-)/g;