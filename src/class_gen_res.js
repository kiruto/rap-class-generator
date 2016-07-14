var annotations = {
    interfaceStart: "// -*-START OF A INTERFACE-*-",
    interfaceEnd: "// -*-END OF A INTERFACE-*-",
    implStart: "// -*-START OF A IMPL-*-",
    implEnd: "// -*-END OF A IMPL-*-"
};
var deleteAnnotations = function(string) {
    return string
        .replace(/\/\/ -\*-START OF A INTERFACE-\*-/g, "")
        .replace(/\/\/ -\*-END OF A INTERFACE-\*-/g, "")
        .replace(/\/\/ -\*-START OF A IMPL-\*-/g, "")
        .replace(/\/\/ -\*-END OF A IMPL-\*-/g, "");
};
function getClassGen() {
var ClassGenUtil = {
    // 类文件作者
    author: "yuriel",
    moduleList: "moduleList",
    pageList: "pageList",
    actionList: "actionList",
    parameterList: "parameterList",

    // 检查ws对象
    checkWS: function() {
        return null != ws && undefined != ws;
    },

    // 拿到数据源
    dataSource: function() {
        return ws._getData();
    },

    getApiPosition: function() {
        var param = window.location.hash;
        if (param.startsWith("#")) {
            return param.split("#")[1];
        }
    },
    findActionById: function(id) {
        var moduleList = this.dataSource().moduleList;
        var found = false;
        var result;
        $.each(moduleList, function(indexModule, module) {
            var pageList = module.pageList;
            $.each(pageList, function(indexPage, page) {
                var actionList = page.actionList;
                $.each(actionList, function(indexAction, action) {
                    found = action.id == id;
                    if (found) {
                        result = action;
                    };
                    return !found;
                });
                return !found;
            });
            return !found;
        });
        return result;
    },

    getAction: function() {
        var id = this.getApiPosition();
        return this.findActionById(id);
    },

    // 拿到注释对象
    getNotes: function(action) {
        return {
            name: action.name,
            description: action.description,
            requestUrl: action.requestUrl,
            rapUrl: window.document.URL
        };
    },

    // 通用工具对象, 禁止外部调用
    utils: {
        linkWrap: function(link) {
            return "<a href=\"" + link + "\" />"
        },
        toUpperCase: function(string) {
            return string.replace(/\_(\w)/g, function(x) {
                return x.slice(1).toUpperCase();
            });
        },
        containsKey: function(obj, key) {
            return typeof obj[key] !== 'undefined';
        },
        editor: function() {
            return {
                    result: "",
                    append: function() {
                        for (var i = 0; i < arguments.length; i++) {
                            this.result += arguments[i];
                        }
                        return this;
                    },
                    newLine: function() {
                        this.result += "\r\n";
                        return this;
                    },
                    line: function(l) {
                        this.result += l + "\r\n";
                        return this;
                    },
                    lines: function(lines) {
                        for (var i = 0; i < lines.length; i++) {
                            this.line(lines[i]);
                        }
                        return this;
                    },
                    clear: function() {
                        this.result = "";
                        return this;
                    },
                    output: function() {
                        return this.result;
                    }
                }
        },
        isEmpty: function(string) {
            return string != undefined && string.replace(/(^s*)|(s*$)/g, "").length ==0
        }
    },

    // java 工具对象, 禁止外部调用
    javaUtils: {
        javaDoc: function() {
            var doc = "\r\n/**";
            var newLine = "\r\n * ";
            $.each(arguments, function(index, line) {
                doc += newLine;
                doc += line;
            });
            doc += "\r\n */";
            return doc;
        },
        jsonKey: function(key) {
            return "@JSONDict(key = \"" + ClassGenUtil.utils.toUpperCase(key) + "\"\r\n"; 
        },

        //在class中添加一个member
        addMember: function(responseParam, clazz, todoClassList) {
            var member = this.getMemberStruct(responseParam.identifier.split("|")[0]);
            var type;
            var typeCheck = {
                number: function() {
                    return "int";
                },
                string: function() {
                    return "String";
                },
                boolean: function() {
                    return "boolean"
                },
                object: function() {
                    return ClassGenUtil.javaUtils.getClassName(responseParam.identifier.split("|")[0]);
                },
                "array<number>": function() {
                    return "ArrayList<Integer>"
                },
                "array<string>": function() {
                    return "ArrayList<String>"
                },
                "array<boolean>": function() {
                    return "ArrayList<Boolean>"
                },
                "array<object>": function() {
                    return "ArrayList<" + ClassGenUtil.javaUtils.getClassName(responseParam.identifier.split("|")[0]) + ">";
                },
                _default: function() {
                    return "String";
                }
            }
            //console.log(responseParam.dataType);
            if (ClassGenUtil.utils.containsKey(typeCheck, responseParam.dataType)) {
                member.type = typeCheck[responseParam.dataType]();
            } else {
                member.type = typeCheck["_default"]();
            }
            member.id = responseParam.id;
            member.deep = clazz.deep + 1;

            var remark = responseParam.remark.split("@mock=");
            if (remark[0].length > 0){
                remark = remark[0];
            } else if (remark.length > 1 && remark[1].length > 0) {
                remark = "格式: " + remark[1];
            } else {
                remark = "";
            }
            if (responseParam.name.trim() != "") {
                member.notes = responseParam.name;
                if (remark.trim() != "") {
                    member.notes += ": " + remark;
                }
            } else {
                member.notes = remark;
            }
            member.name = this.getMemberName(responseParam.identifier.split("|")[0]);
            if (responseParam.parameterList.length > 0) {
                var todoClass = this.getTodoClassListStruct();
                todoClass.identifier = responseParam.identifier.split("|")[0];
                todoClass.parameterList = responseParam.parameterList;
                todoClass.name = responseParam.name;
                todoClass.remark = responseParam.remark;
                todoClassList.push(todoClass);
            }
            clazz.members.push(member);
            return member;
        },

        addInnerClass: function(innerClassList, todoClassList) {
            while (todoClassList.length > 0) {
                var clazz = todoClassList.pop();
                var innerClass = this.getInnerClassStruct();
                //console.log(innerClass);
                innerClass.id = clazz.id;
                innerClass.deep = 1;
                innerClass.className = this.getClassName(clazz.identifier);
                var remark = clazz.remark.split("@mock=");
                if (remark[0].length > 0){
                    remark = remark[0];
                } else if (remark.length > 1 && remark[1].length > 0) {
                    remark = "格式: " + remark[1];
                } else {
                    remark = "";
                }
                if (clazz.name.trim() != "") {
                    innerClass.notes = clazz.name;
                    if (remark.trim() != "") {
                        innerClass.notes += ": " + remark;
                    }
                } else {
                    innerClass.notes = remark;
                }
                for (var i = clazz.parameterList.length - 1; i >= 0; i--) {
                    var param = clazz.parameterList[i];
                    this.addMember(param, innerClass, todoClassList);
                }
                innerClassList.push(innerClass);
            }
            return innerClassList;
        },

        // 生成一个class对象
        addClass: function(responseParamList) {
            var clazz = this.getClassStruct();
            for (var i = responseParamList.length - 1; i >= 0; i--) {
                //console.log(responseParamList[i]);
                this.addMember(responseParamList[i], clazz, clazz.todoClassList);
            }
            this.addInnerClass(clazz.innerClasses, clazz.todoClassList);
            return clazz;
        },

        // 下划线命名转驼峰类名
        getClassName: function(string) {
            var name = ClassGenUtil.utils.toUpperCase(string);
            return name[0].toUpperCase() + name.slice(1);
        },

        // 下划线命名转小些驼峰
        getMemberName: function(string) {
            return ClassGenUtil.utils.toUpperCase(string);
        },
        getClassStruct: function() {
            return {
                deep: 0,
                imports: ["java.util.ArrayList", "me.chunyu.g7json.annotation.JSONDict"],
                modifiers: ["public", "class"],
                className: "",
                members: [],
                innerClasses: [],
                todoClassList: []
            }
        },
        getInnerClassStruct: function() {
            return {
                id: 0,
                deep: 1,
                modifiers: ["public", "static", "class"],
                className: "",
                notes: "",
                members: []
            }
        },
        getMemberStruct: function(key) {
            return {
                id: 0,
                deep: 0,
                notes: "",
                annotation: "@JSONDict(key = \"" + key + "\")",
                modifier: "public",
                type: "",
                name: ""
            }
        }, 
        getTodoClassListStruct: function() {
            return {
                id: 0,
                name: "",
                remark: "",
                identifier: "",
                parameterList: []
            }
        }
    },

    // 生成java class的逻辑
    javaGen: function() {
        var id = ClassGenUtil.getApiPosition();
        var action = ClassGenUtil.findActionById(id);
        //console.log(action);
        return {
            indent: function(int) {
                return new Array(int + 1).join("    ");
            },
            getClassName: function() {
                return "ClassName";
            },

            // 生成import列表
            getImports: function(imports) {
                var result = "";
                for (var i = imports.length - 1; i >= 0; i--) {
                    result += "import " + imports[i] + ";\r\n"
                }
                return result;
            },

            getClassDocumentWrapper: function(clazz) {
                var head = "";
                var end = "}";
                for (var i = 0; i < clazz.modifiers.length; i++) {
                    head += clazz.modifiers[i] + " ";
                }
                head += clazz.className + " {";
                return [head, end];
            },

            getMembers: function(clazz) {
                var result = "";
                for (var i = clazz.members.length - 1; i >= 0; i--) {
                    var mem = clazz.members[i];
                    if (mem.notes.trim() != "") {
                        result += this.indent(mem.deep);
                        result += "// " + mem.notes + "\r\n"
                    }
                    result += this.indent(mem.deep);
                    result += mem.annotation + "\r\n";
                    result += this.indent(mem.deep);
                    result += mem.modifier + " " + mem.type + " " + mem.name + ";\r\n\r\n";
                }
                return result;
            },

            getInnerClasses: function(clazz) {
                var result = "";
                for (var i = clazz.innerClasses.length - 1; i >= 0; i--) {
                    var inner = clazz.innerClasses[i];
                    //console.log(inner);
                    var wrapper = this.getClassDocumentWrapper(inner);
                    result += this.indent(inner.deep);
                    result += wrapper[0] + "\r\n\r\n";
                    result += this.getMembers(inner);
                    result += this.indent(inner.deep);
                    result += wrapper[1] + "\r\n\r\n"
                }
                return result;
            },

            // 生成文件注释
            getJavaDoc: function() {
                var note = ClassGenUtil.getNotes(action);
                var date = new Date($.now());
                var dateString = (date.getDate()) + "/" + (date.getMonth() + 1) + "/" + ('' + (date.getFullYear())).slice(-2);
                var header = "Created by "+ ClassGenUtil.author + " on " + dateString + ".";
                return ClassGenUtil.javaUtils.javaDoc(
                    header,
                    note.name,
                    note.description, 
                    note.requestUrl, 
                    ClassGenUtil.utils.linkWrap(note.rapUrl)
                );
            },

            // 返回完整的java文档对象
            getClassObject: function() {
                return ClassGenUtil.javaUtils.addClass(action.responseParameterList);
            },

            // 返回完整的java文档
            getJavaClassDocument: function() {
                var builder = ClassGenUtil.utils.editor();
                var classObj = this.getClassObject();
                classObj.className = this.getClassName();
                builder.newLine()
                    .line(this.getJavaDoc())
                    .line(this.getImports(classObj.imports))
                    .line(this.getClassDocumentWrapper(classObj)[0])
                    .line(this.getMembers(classObj))
                    .append(this.getInnerClasses(classObj))
                    .line(this.getClassDocumentWrapper(classObj)[1]);

                return builder.output();
            },

            // 弹出新窗口显示文档
            display: function() {
                var display = {
                    header: "<html><head><link rel=\"stylesheet\" href=\"//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/styles/default.min.css\"><script src=\"//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/highlight.min.js\"></script><script>hljs.initHighlightingOnLoad();</script></head><body><pre style=\"word-wrap: break-word; white-space: pre-wrap;\"><code class=\"java\">",
                    footer: "</code></pre><script>hljs.highlightBlock($('pre code'))</script></body></html>"
                };

                myWindow=window.open('','','');
                myWindow.document.write(display.header + this.getJavaClassDocument().replace(/\%/g,"%25").replace(/\&/g,"%26").replace(/</g, '&lt;').replace(/>/g, '&gt;') + display.footer);
                myWindow.focus();
            },

            // add dom
            addButton: function() {
                var dom = "<button type=\"button\" class=\"btn btn-success btn-sm\" onclick=\"ClassGenUtil.javaGen().display();\"><span class=\"glyphicon glyphicon-export\"></span>导出Java类</button>";
                $("#div-control-panel").append(dom);
            }
        };
    },

    ocUtils: {
        action: function() {
            return ClassGenUtil.getAction();
        },

        // 下划线命名转驼峰类名
        getClassName: function(string) {
            var name = ClassGenUtil.utils.toUpperCase(string);
            return name[0].toUpperCase() + name.slice(1);
        },

        // 下划线命名转小些驼峰
        getMemberName: function(string) {
            return ClassGenUtil.utils.toUpperCase(string);
        },

        getRequestData: function() {
            return this.action().requestParameterList;
        },

        getResponseData: function() {
            return this.action().responseParameterList;
        },

        getClassStruct: function() {
            return {
                rank: 0,
                notes: "",
                interface: {
                    name: "",
                    property: []
                },
                hasImplementation: false, 
                implementation: [],
                arrayContent:[],
                isRootClass: false
            }
        },

        getMemberStruct: function(type, name, notes) {
            return {
                key: "",
                type: type,
                name: name,
                notes: notes
            }
        },

        getImplementationStruct: function(key) {
            return {
                key: key,
                name: ClassGenUtil.utils.toUpperCase(key)
            }
        },

        getArrayContentStruct: function(member, type) {
            return {
                member: member,
                type: type
            }
        },

        getTodoClassListStruct: function() {
            return {
                id: 0,
                rank: 0,
                name: "",
                remark: "",
                identifier: "",
                parameterList: []
            }
        },

        addMember: function(param, clazz, dependencies, depth) {
            var member = this.getMemberStruct();
            var typeCheck = {
                number: function() {
                    return ["n", "NSNumber"];
                },
                string: function() {
                    return ["n", "NSString"];
                },
                boolean: function() {
                    return ["n", "BOOL"];
                },
                object: function() {
                    return ["n", ClassGenUtil.javaUtils.getClassName(param.identifier.split("|")[0])];
                },
                "array<number>": function() {
                    return ["a", "NSNumber"];
                },
                "array<string>": function() {
                    return ["a", "NSString"];
                },
                "array<boolean>": function() {
                    return ["a", "BOOL"];
                },
                "array<object>": function() {
                    var key = param.identifier.split("|")[0];
                    var t = ClassGenUtil.javaUtils.getClassName(key);
                    var arrayContent = ClassGenUtil.ocUtils.getArrayContentStruct(ClassGenUtil.ocUtils.getMemberName(key), t);
                    clazz.arrayContent.push(arrayContent);
                    return ["a", t];
                },
                _default: function() {
                    return ["n", "NSString"];
                }
            }
            if (ClassGenUtil.utils.containsKey(typeCheck, param.dataType)) {
                member.type = typeCheck[param.dataType]();
            } else {
                member.type = typeCheck["_default"]();
            }
            var remark = param.remark.split("@mock=");
            if (remark[0].length > 0){
                remark = remark[0];
            } else if (remark.length > 1 && remark[1].length > 0) {
                remark = "格式: " + remark[1];
            } else {
                remark = "";
            }
            if (param.name.trim() != "") {
                member.notes = param.name;
                if (remark.trim() != "") {
                    member.notes += ": " + remark;
                }
            } else {
                member.notes = remark;
            }
            member.key = param.identifier.split("|")[0];
            member.name = this.getMemberName(member.key);
            if (member.key.indexOf("_") > 0) {
                clazz.hasImplementation = true;
                var impl = this.getImplementationStruct(member.key);
                clazz.implementation.push(impl);
            }
            if (param.parameterList.length > 0) {
                var todoClass = this.getTodoClassListStruct();
                todoClass.identifier = param.identifier.split("|")[0];
                todoClass.parameterList = param.parameterList;
                todoClass.name = param.name;
                todoClass.remark = param.remark;
                //console.log(clazz.rank, depth);
                todoClass.rank = clazz.rank / depth;
                
                clazz.rank ++;
                dependencies.push(todoClass);
            }
            clazz.interface.property.push(member);
            return member;
        },

        addClass: function(paramList, className) {
            var classes = [];
            var todoList = [];
            var clazz = this.getClassStruct();
            clazz.interface.name = className;
            clazz.isRootClass = true;
            classes.push(clazz);
            for (var i = paramList.length - 1; i >= 0; i--) {
                //console.log(paramList[i]);
                this.addMember(paramList[i], clazz, todoList, 10);
            }
            this.addInnerClass(classes, todoList);
            classes.sort(function(a, b) {
                return a.rank - b.rank;
            });
            return classes;
        },

        addInnerClass: function(classes, todoClassList) {
            var depth = 10;
            while (todoClassList.length > 0) {
                var clazz = todoClassList.pop();
                var innerClass = this.getClassStruct();
                //console.log(innerClass);
                //innerClass.id = clazz.id;
                //innerClass.deep = 1;
                innerClass.rank = clazz.rank;
                innerClass.interface.name = this.getClassName(clazz.identifier);
                var remark = clazz.remark.split("@mock=");
                if (remark[0].length > 0){
                    remark = remark[0];
                } else if (remark.length > 1 && remark[1].length > 0) {
                    remark = "格式: " + remark[1];
                } else {
                    remark = "";
                }
                if (clazz.name.trim() != "") {
                    innerClass.notes = clazz.name;
                    if (remark.trim() != "") {
                        innerClass.notes += ": " + remark;
                    }
                } else {
                    innerClass.notes = remark;
                }
                innerClass.notes.replace(/\r/g, " ").replace(/\n/g, " ");
                for (var i = clazz.parameterList.length - 1; i >= 0; i--) {
                    var param = clazz.parameterList[i];
                    this.addMember(param, innerClass, todoClassList, depth);
                }
                classes.push(innerClass);
                depth *= 10;
            }
            return classes;
        }

    },

    ocTemplate: {
        type: {
            int: "int",
            bool: "BOOL",
            string: "NSString",
            number: "NSNumber",
            array: "NSArray<{{$type}} *>",
            object: "{{$type}}"
        },
        ocType: {
            "int": "int",
            "BOOL": "bool",
            "NSString": "string",
            "NSNumber": "number",
        },
        divider: "// ------------------------------------------------------------------------------\r\n",
        note: "// {{$note}}\r\n",
        interface: "@interface {{$type}} : NSObject\r\n",
        implementation: "@implementation {{$type}}\r\n",
        "int": "@property(nonatomic, assign) int {{$var}};\r\n",
        "NSString": "@property(nonatomic, copy) NSString *{{$var}};\r\n",
        "NSNumber": "@property(nonatomic, copy) NSNumber *{{$var}};\r\n",
        "BOOL": "@property(nonatomic, assign) BOOL {{$var}};\r\n",
        array: "@property(nonatomic, strong) NSArray<{{$type}} *> *{{$var}};\r\n",
        object: "@property(nonatomic, strong) {{$type}} *{{$var}};\r\n",
        end: "@end\r\n",
        replaceKeys: "\
+ (NSString *)mj_replacedKeyFromPropertyName121:(NSString *)propertyName {\r\n\
{{$line}}\r\n\
    return [propertyName mj_underlineFromCamel];\r\n\
}\r\n",
        replaceKeyStatement: "\
    if([propertyName isEqualToString:@\"{{$var}}\"]){\r\n\
        return @\"{{$key}}\";\r\n\
    }\r\n",
        objectInArray: "\
+ (NSDictionary *)mj_objectClassInArray {\r\n\
    return @{\r\n\
{{$line}}\r\n\
    };\r\n\
}\r\n",
        arrayContentStatement: "\
            @\"{{$var}}\" : [{{$type}} class]\r\n\
        ",
        dividerMojiRequest: "\
//　 ∧_∧\r\n\
//　( ･ω･)\r\n\
//　｜⊃／(＿＿＿\r\n\
//／└-(＿＿＿_／\r\n\
//￣￣￣￣￣￣\r\n\
// REQUEST\r\n\
",
        dividerMojiResponse: "\
//　　　 ∧＿∧\r\n\
//　　　(´･ω･)\r\n\
//　　　(つ夢と)\r\n\
//　　　 ｕ―ｕ\r\n\
// RESPONSE\r\n\
",
        getStruct: function(key, type, varName, line, note) {
            return {
                key: key,
                type: type,
                varName: varName,
                line: line,
                note: note
            }
        },

        parse: function(template, object) {
            return template
                .replace(/{{\$key}}/g, object.key)
                .replace(/{{\$type}}/g, object.type)
                .replace(/{{\$var}}/g, object.varName)
                .replace(/{{\$line}}/g, object.line)
                .replace(/{{\$note}}/g, object.note);
        },

        parseNote: function(note) {
            if (!ClassGenUtil.utils.isEmpty(note)) {
                return this.note.replace(/{{\$note}}/g, note);
            } else {
                return false;
            }
        },

        parseMember: function(template, property) {
            var type = "";
            var result = "";
            //console.log(property.key, property.type[0], property.type[1])
            if (property.type[0] == "a") {
                type = this.type.array.replace(/{{\$type}}/g, property.type[1]);
            } else if (property.type[0] == "n") {
                type = property.type[1];
            } else {
                return;
            }
            var parser = this.getStruct(property.key, type, property.name, "", property.notes);
            //console.log(type);
            var note = this.parseNote(property.notes);
            if (note) {
                result += note;
            }
            result += this.parse(template, parser)
            return result;
        },

        parseInterface: function(type, notes) {
            var result = "";
            var parser = this.getStruct('', type);
            var note = this.parseNote(notes);
            if (note) {
                result += note;
            }
            result += this.parse(this.interface, parser);
            return result;
        },

        parseImpl: function(clazz){
            var parserHeader = this.getStruct('', clazz.interface.name);
            var result = "";
            result += this.parse(this.implementation, parserHeader);
            if (clazz.hasImplementation) {
                var parserContent = this.getStruct();
                parserContent.line = "";
                for (var i = clazz.implementation.length - 1; i >= 0; i--) {
                    var impl = clazz.implementation[i];
                    var parserImplContent = this.getStruct();
                    parserImplContent.varName = impl.name;
                    parserImplContent.key = impl.key;
                    parserContent.line += this.parse(this.replaceKeyStatement, parserImplContent);
                }
                result += this.parse(this.replaceKeys, parserContent);
            }
            if (clazz.arrayContent.length > 0) {
                var parserArray = this.getStruct();
                parserArray.line = "";
                for (var i = clazz.arrayContent.length - 1; i >= 0; i--) {
                    var content = clazz.arrayContent[i];
                    var parserArrayContent = this.getStruct();
                    parserArrayContent.varName = content.member;
                    parserArrayContent.type = content.type;
                    parserArray.line += this.parse(this.arrayContentStatement, parserArrayContent);
                }
                result += this.parse(this.objectInArray, parserArray);
            }
            result += "\r\n" + this.end;
            return result;
        },
    },

    ocGen: function() {
        var reg = /:[^/]*\//g;
        var action = arguments[arguments.length - 1];
        if (!action || typeof action !== 'object') {
            action = ClassGenUtil.getAction();
        }
        var actionUrl = action.requestUrl.replace(reg, "").replace(/\//g, "_");
        //console.log(action);
        var template = ClassGenUtil.ocTemplate;
        return {
            indent: function(int) {
                    return new Array(int + 1).join("    ");
            },

            // 返回完整的oc文档对象
            getRequestClassObject: function() {
                var defaultRequestClassName = "RequestModel";
                defaultRequestClassName += ClassGenUtil.ocUtils.getClassName(actionUrl).replace(/_/g, "");
                return ClassGenUtil.ocUtils.addClass(action.requestParameterList, defaultRequestClassName);
            },

            getResponseClassObject: function() {
                var defaultResponseClassName = "ResponseModel";
                defaultResponseClassName += ClassGenUtil.ocUtils.getClassName(actionUrl.replace(/_/g, ""));
                return ClassGenUtil.ocUtils.addClass(action.responseParameterList, defaultResponseClassName);
            },

            parseMember: function(member) {
                var temp;
                if ("n" == member.type[0] && ClassGenUtil.utils.containsKey(template.ocType, member.type[1])) {
                    temp = template[member.type[1]];
                } else {
                    temp = template.object;
                }
                return template.parseMember(temp, member);
            },

            parseInterface: function(clazz) {
                return template.parseInterface(clazz.interface.name, clazz.notes);
            },

            parseImpl: function(clazz, index, isRequest) {
                var result = "";
                if (clazz.isRootClass) {
                    result += "\r\n// URL: " + action.requestUrl + "\r\n";
                }
                if (0 == index && isRequest) {
                    result += template.dividerMojiRequest;
                } else if(0 == index && !isRequest) {
                    result += template.dividerMojiResponse;
                }
                result += template.parseImpl(clazz);
                return result;
            },

            getOCClassDocument: function(classes, noteName, isRequest) {
                var builder = ClassGenUtil.utils.editor();
                builder.append(template.divider).line(noteName);
                for (var i = 0; i < classes.length; i ++) {
                    builder
                        .append(annotations.interfaceStart)
                        .append(template.divider)
                        .newLine();
                    if (classes[i].isRootClass) {
                        builder.append("// URL: " + action.requestUrl + "\r\n");
                    }
                    if (0 == i && isRequest) {
                        builder.append(template.dividerMojiRequest);
                    } else if(0 == i && !isRequest) {
                        builder.append(template.dividerMojiResponse);
                    }
                    builder
                        .append(this.parseInterface(classes[i]))
                    for (var j = classes[i].interface.property.length - 1; j >= 0; j--) {
                        var member = classes[i].interface.property[j];
                        builder.append(this.parseMember(member))
                    }
                    builder.newLine()
                        .append(template.end)
                        .append(annotations.interfaceEnd)
                        .newLine()
                        .append(annotations.implStart)
                        .append(this.parseImpl(classes[i], i, isRequest))
                        .append(annotations.implEnd);
                }
                return builder.output();
            },

            getOCDocument: function() {
                var gen = ClassGenUtil.ocGen(action);
                var request = gen.getOCClassDocument(gen.getRequestClassObject(), "// REQUEST MODEL", true);
                var response = gen.getOCClassDocument(gen.getResponseClassObject(), "// RESPONSE MODEL", false);
                return deleteAnnotations(request + response);
            },

            getRaw: function() {
                var gen = ClassGenUtil.ocGen(action);
                var request = gen.getOCClassDocument(gen.getRequestClassObject(), "// REQUEST MODEL", true);
                var response = gen.getOCClassDocument(gen.getResponseClassObject(), "// RESPONSE MODEL", false);
                return request + response;
            },

            display: function() {
                var display = {
                    header: "<!DOCTYPE>\r\n<html><head><link rel=\"stylesheet\" href=\"//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/styles/default.min.css\"><script src=\"//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.5.0/highlight.min.js\"></script><scr" + "ipt type=\"text/javascript\">function init() {hljs.initHighlightingOnLoad();hljs.highlightBlock($(\"pre code\"));} window.onload = init;</scr" + "ipt></head><body><pre style=\"word-wrap: break-word; white-space: pre-wrap;\"><code class=\"lang-objectivec\">",
                    footer: "</code></pre></body></html>"
                };

                myWindow = window.open('', '', '');
                //myWindow.hljs = hljs;
                myWindow.document.write(display.header + this.getOCDocument().replace(/\%/g,"%25").replace(/\&/g,"%26").replace(/</g, '&lt;').replace(/>/g, '&gt;') + display.footer);
                myWindow.focus();
                /*
                myWindow.addEventListener('load', function(){
                    myWindow.init();
                    console.log("done");
                }, true);
                */
                /*
                myWindow.onload = function() {
                    myWindow.hljs.initHighlightingOnLoad();
                    myWindow.hljs.highlightBlock(myWindow.$('pre code', myWindow.document));
                }
                */

            },

            addButton: function() {
                var dom = "<button type=\"button\" class=\"btn btn-success btn-sm\" onclick=\"getClassGen().ocGen().display();\"><span class=\"glyphicon glyphicon-export\"></span>导出.h文件</button>";
                $("#div-control-panel").append(dom);
            }
        }
    }
}
return ClassGenUtil;
}

//ClassGenUtil.javaGen().addButton()
//console.log(getClassGen().ocGen().getOCClassDocument(getClassGen().ocGen().getResponseClassObject(), "// Response"))
var javaDom = "<button type=\"button\" class=\"btn btn-success btn-sm\" onclick=\"getClassGen().javaGen().display();\"><span class=\"glyphicon glyphicon-export\"></span>导出Java类</button>";
$("#div-control-panel").append(javaDom);
var ocDom = "<button type=\"button\" class=\"btn btn-info btn-sm\" onclick=\"getClassGen().ocGen().display();\"><span class=\"glyphicon glyphicon-export\"></span>导出.h文件</button>";
$("#div-control-panel").append(ocDom);