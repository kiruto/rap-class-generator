# JSON Class Generator

### 简介
本工程是依赖RAPAPI服务的扩展功能，可根据RAP上定义的接口信息生成android和ios开发用的类文件。android生成的java文件可用于GSON等主流框架或基于annotation的自制框架。ios生成的.H和.M文件可用于MJExtension。

### 使用方法
1. 安装nodejs环境及grunt;
2. 根据你的情况编辑src/config.js;
若需要用于gson，只需做如下修改：
```javascript
$ClassGen.JSON_ANNOTATION = "@SerializedName(\"{{$key}}\")\r\n";
$ClassGen.IMPORT_CLASS = "com.google.gson.annotations.serializedname";
```

3. 使用grunt生成脚本：
```shell
npm install
grunt
```

4. 若拥有权限，可以将生成的dist/class_gen.min.js文件传到服务器上，并在服务器的<rap_root>/workspace/myWorkspace.vm文件的<html>标签内嵌入：
```html
<script type="text/javascript" src="class_gen.min.js?_r=$!timeStamp"></script>
```

5. 若仅自己使用，可以安装chrome_extension/extension.crx 插件，达到同样效果。

### Links
* [RAPAPI] http://thx.github.io/RAP
* [GSON] https://github.com/google/gson
* [MJExtension] https://github.com/CoderMJLee/MJExtension