# 小程序海报生成工具,可视化编辑直接生成代码

## 体验地址

请点击这个链接体验[>>painter-custom-poster](https://lingxiaoyi.github.io/painter-custom-poster/)
生成painter代码,充分利用painter的优势

- 小程序生成图片库，轻松通过 json 方式绘制一张可以发到朋友圈的图片[>>Painter](https://github.com/Kujiale-Mobile/Painter)

## 使用

```bash
git clone https://github.com/lingxiaoyi/painter-custom-poster.git
```

```bash
npm i
```

- 启动本地服务器

```bash
npm run start
```

## How To Use

目前工具一共分成4部分

### 例子展示

用来将一些用户设计的精美海报显示出来,通过点击对应的例子并将代码导入画布中

### 画布区

显示真实的海报效果,画布里添加的元素,都可以直接用鼠标进行拖动,旋转,缩放操作

### 操作区

第一排四个按钮

1. 复制代码 将画布的展示效果转化成小程序海报插件库所需要的json配置代码,目前我使用的是Painter库,默认会转化成这个插件的配置代码,将代码直接复制到card.js即可
2. 查看代码  这个功能用不用无所谓,可以直观的看到生成的代码
3. 导出json 将画布转化成fabric所需要的json代码,方便将自己设计的海报代码保存下来
4. 导入json 将第3步导出的json代码导入,会在画布上显示已设计的海报样式

第二排五个按钮

1. 画布 画布的属性参数 详解见下方
2. 文字 添加文字的属性参数 详解见下方
3. 矩形 添加矩形的属性参数 详解见下方
4. 图片 添加图片的属性参数 详解见下方
5. 二维码 添加二维码的属性参数 详解见下方
  
第三排

各种元素的详细设置参数

### 激活区

激活对象是指鼠标点击画布上的元素,该对象会被蓝色的边框覆盖,此时该对象被激活,可以执行拖动 旋转 缩放等操作
激活区只有对象被激活才会出来,用来设置激活对象的各种配置参数,修改value值后,实时更新当前激活对象的对应状态,点击其他区域,此模块将隐藏

## 快捷键

- 'ctrl + ←'  左移激活对象一像素
- 'ctrl + →'  右移激活对象一像素
- 'ctrl + ↑'  上移激活对象一像素
- 'ctrl + ↓'  下移激活对象一像素
- 'ctrl + z'  撤销
- 'ctrl + y'  撤销
- 'delete'    删除
- '[' 提高元素的层级
- ']' 降低元素的层级

## 布局属性

### 通用布局属性

| 属性          | 说明                              | 默认          |
| ------------- | --------------------------------- | ------------- |
| rotate        | 旋转，按照顺时针旋转的度数        | 0             |
| width、height | view 的宽度和高度                 |               |
| top、left     | 如 css 中为 absolute 布局时的作用 | 0             |
| background    | 背景颜色                          | rgba(0,0,0,0) |
| borderRadius  | 边框圆角                          | 0             |
| borderWidth   | 边框宽                            | 0             |
| borderColor   | 边框颜色                          | #000000       |
| shadow        | 阴影                              | ''            |

#### shadow

可以同时修饰 image、rect、text 等 。在修饰 text 时则相当于 text-shadow；修饰 image 和 rect 时相当于 box-shadow

使用方法：

```css
shadow: 'h-shadow v-shadow blur color';
h-shadow: 必需。水平阴影的位置。允许负值。
v-shadow: 必需。垂直阴影的位置。允许负值。
blur: 必需。模糊的距离。
color: 必需。阴影的颜色。
举例: shadow:10 10 5 #888888
```

#### 渐变色支持

你可以在画布的 background 属性中使用以下方式实现 css 3 的渐变色，其中 radial-gradient 渐变的圆心为 中点，半径为最长边，目前不支持自己设置。

```css
linear-gradient(-135deg, blue 0%, rgba(18, 52, 86, 1) 20%, #987 80%)

radial-gradient(rgba(0, 0, 0, 0) 5%, #0ff 15%, #f0f 60%)
```

**！！！注意：颜色后面的百分比一定得写。**

### 画布属性

| 属性  | 说明                                                            | 默认 |
| ----- | --------------------------------------------------------------- | ---- |
| times | 控制生成插件代码的宽度大小,比如画布宽100,times为2,生成的值为200 | 1    |

### 文字属性

| 属性名称       | 说明                                                   | 默认值                   |
| -------------- | ------------------------------------------------------ | ------------------------ |
| text           | 字体内容                                               | 别跟我谈感情，谈感情伤钱 |
| maxLines       | 最大行数                                               | 不限，根据 width 来      |
| lineHeight     | 行高（上下两行文字baseline的距离）                     | 1.3                      |
| fontSize       | 字体大小                                               | 30                       |
| color          | 字体颜色                                               | #000000                  |
| fontWeight     | 字体粗细。仅支持 normal, bold                          | normal                   |
| textDecoration | 文本修饰，支持none  underline、 overline、 linethrough | none                     |
| textStyle      | fill： 填充样式，stroke：镂空样式                      | fill                     |
| fontFamily     | 字体                                                   | sans-serif               |
| textAlign      | 文字的对齐方式，分为 left, center, right               | left                     |

备注:

- fontFamily 工具第一个例子支持文字字体,但是导入小程序为什么看不到呢，[小程序官网加载网络字体方法>>](https://developers.weixin.qq.com/miniprogram/dev/api/ui/font/wx.loadFontFace.html) [加载字体教程>>](https://juejin.im/post/5cd0402bf265da038932a88e)
- 文字高度 是maxLines lineHeight2个字段一起计算出来的

### 图片属性

| 属性 | 说明                 | 默认       |
| ---- | -------------------- | ---------- |
| url  | 图片路径             |            |
| mode | 图片裁剪、缩放的模式 | aspectFill |

mode参数详解

- scaleToFill 缩放图片到固定的宽高
- aspectFill 图片裁剪显示对应的宽高
- auto 自动填充 宽度全显示 高度自适应居中显示
  
## Tips（一定要看哦～）

- painter现在只支持这几种图形,所以暂不支持圆,线等
- 如果编辑过程,一个元素被挡住了,无法操作,请选择对象并通过[ ]快捷键提高降低元素的层级
- 文字暂不支持直接缩放操作,因为文字大小和元素高度不容易计算,可以通过修改激活栏目maxLines lineHeight fontSize值来动态改变元素
- 如发现导出的代码一个元素被另一个元素挡住了,请手动调整元素的位置,json数组中元素越往后层级显示就越高,由于painter没有提供层级参数,所以目前只能这样做
- 本工具导出代码全是以px为单位,为什么不支持rpx, 因为painter在rpx单位下,阴影和边框宽会出现大小计算问题,由于原例子没有提供px生成图片方案,可以下载我这里修改过的demo[>>Painter](https://github.com/lingxiaoyi/Painter.git)即可解决
- 文本宽度随着字数不同而动态变化，想在文本后面加个图标根据文本区域长度布局, 请参考Painter文档这块教程直接修改源码
- 由于本工具开发有些许难度,如出现bug,建议或者使用上的问题,请提issue,源码地址[>>painter-custom-poster](https://github.com/lingxiaoyi/painter-custom-poster)

## 海报贡献

如果你设计的海报很好看,并且愿意开源贡献,可以贡献你的海报代码和缩略图,例子代码文件在example中,按顺序排列,例如现在库里例子是example2.js,那你添加example3.js和example3.jpg图片,事例可以参考一下文件夹中源码,然后在index.js中导出一下

### 导出代码

代码不要格式化,会报错,请原模原样复制到json字段里

### 生成缩略图

- 刚开始我想在此工具中直接生成图片,但是由于浏览器图片跨域问题导致报错失败
- 所以请去小程序中生成保存图片,图片质量设置0.2,并去[tinypng](https://tinypng.com/)压缩一下图片
- 找到painter.js,替换下边这个方法,可以生成0.2质量的图片,代码如下

```js
  saveImgToLocal() {
      const that = this;
      setTimeout(() => {
        wx.canvasToTempFilePath(
          {
            canvasId: 'k-canvas',
            fileType: 'jpg',
            quality: 0.2,
            success: function(res) {
              that.getImageInfo(res.tempFilePath);
            },
            fail: function(error) {
              console.error(`canvasToTempFilePath failed, ${JSON.stringify(error)}`);
              that.triggerEvent('imgErr', { error: error });
            }
          },
          this
        );
      }, 300);
    }
```

## TODO

- [ ] 颜色值选择支持调色板工具
- [ ] 文字padding支持
- [ ] 缩放位置弹跳问题优化
- [ ] 假如需求大的话,支持其他几款插件库代码的生成

~
创作不易,如果对你有帮助，请给个星星 star✨✨ 谢谢
~
