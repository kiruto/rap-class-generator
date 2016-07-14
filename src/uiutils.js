//UI

var checked = [];
var displayOutput = function(string) {
    var display = {
        header: "<!DOCTYPE>\r\n<html><head><link rel=\"stylesheet\" href=\"//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/styles/default.min.css\"><script src=\"//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/highlight.min.js\"></script><scr" + "ipt type=\"text/javascript\">function init() {hljs.initHighlightingOnLoad();hljs.highlightBlock($(\"pre code\"));} window.onload = init;</scr" + "ipt></head><body><pre style=\"word-wrap: break-word; white-space: pre-wrap;\"><code class=\"lang-objectivec\">",
        footer: "</code></pre></body></html>"
    };

    myWindow = window.open('', '', '');
    myWindow.document.write(display.header + string.replace(/\%/g,"%25").replace(/\&/g,"%26").replace(/</g, '&lt;').replace(/>/g, '&gt;') + display.footer);
    myWindow.focus();
}
var getUiUtils = function() {
return {
    addCheckBox: function() {
        $(".ec-tree").not(".more").each(function(index, dom) {
            var id = dom.id.split("div-a-tree-node-")[1];
            $(dom).prepend('<input type="checkbox" class="uiCheckbox" id="uiCheckbox-' + id + '" ui-id=' + id + ' onchange="toggleCheckbox(' + id + ')"/>');
        });
    },

    removeCheckBox: function() {
        $(".uiCheckbox").remove();
    },

    getDocument: function() {
        var result = "";
        for (var i = 0; i < checked.length; i++) {
            var id = checked[i];
            var action = getClassGen().findActionById(id);
            //console.log(action);
            result += getClassGen().ocGen(action).getRaw();
        }
        return result;
    },

    getInterface: function() {
        var array = this.getDocument().match($ClassGen.interfaceReg);
        var result = "";
        for (var i = 0; i < array.length; i++) {
            result += $ClassGen.deleteAnnotations(array[i]);
        }
        return result;
    },

    getImpl: function() {
        var array = this.getDocument().match($ClassGen.implReg);
        var result = "";
        for (var i = 0; i < array.length; i++) {
            result += $ClassGen.deleteAnnotations(array[i]);
        }
        return result;
    },

    addFunc: function() {
        this.addCheckBox();
        var hFileDom = '<a id="batch-export-hfile" onclick="displayOutput(getUiUtils().getInterface())" style="margin-right:10px">导出H文件</a>';
        var mFileDom = '<a id="batch-export-mfile" onclick="displayOutput(getUiUtils().getImpl())" style="margin-right:10px">导出M文件</a>';
        var removeDom = '<button style="margin-right:10px;" id=\"remove-func-btn\" type=\"button\" class=\"btn btn-success btn-sm\" onclick=\"getUiUtils().removeFunc();\"><span class=\"glyphicon glyphicon-export\"></span>关闭</button>';
        $("#batch-export-btn").remove();
        $("#div-mt-list").append(removeDom);
        $("#div-mt-list").append(hFileDom).append(mFileDom);

    },

    removeFunc: function() {
        checked = [];
        this.removeCheckBox();
        $("#remove-func-btn").remove();
        $("#batch-export-hfile").remove();
        $("#batch-export-mfile").remove();
        var batchExportDom = "<button id=\"batch-export-btn\" type=\"button\" class=\"btn btn-success btn-sm\" onclick=\"getUiUtils().addFunc();\"><span class=\"glyphicon glyphicon-export\"></span>批量导出ios文件</button>";
        $("#div-mt-list").append(batchExportDom);
    }
}
}
var toggleCheckbox = function(id) {
    if($("#uiCheckbox-" + id).is(":checked")) {
        if (checked.indexOf(id) < 0) {
            checked.push(id);
        }
    } else {
        var index = checked.indexOf(id);
        if (index > -1) {
            checked.splice(index, 1);
        }
    }
}
if (ensureUrl()) {
    var batchExportDom = "<button id=\"batch-export-btn\" type=\"button\" class=\"btn btn-success btn-sm\" onclick=\"getUiUtils().addFunc();\"><span class=\"glyphicon glyphicon-export\"></span>批量导出ios文件</button>";
    setTimeout(function() {
        $(document).ready(function() {$("#div-mt-list").append(batchExportDom);})
    }, 100)
}



