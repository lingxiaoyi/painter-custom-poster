let commonProps = {
  color: 'red', //字体颜色 linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)
  background: '#ffffff', //文字区域背景色
  top: 100,
  left: 100,
  width: 500,
  height: 100, //高度,没有的话就自适应
  rotate: 0,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: '#000000',
  //align: ['center', 'left', 'right'], //view 的对齐方式
  shadow: '10 10 5 #888888' //阴影
};
export default [
  {
    type: 'canvas',
    css: {
      width: '654',
      height: '1000',
      backgroundColor: '#f8f8f8'
    }
  },
  {
    type: 'text',
    name: '文字',
    css: {
      ...commonProps,
      background: 'rgba(0,0,0,0)',
      width: 200,
      height: 50,
      text: '    我是来测试的阿发发萨芬撒发',
      fontSize: 30,
      fontWeight: 'bold', //文字加粗 可以不写
      maxLines: 2, //最大行数
      lineHeight: 1.5,
      textStyle: ['fill', 'stroke'], //fill： 填充样式，stroke：镂空样式
      fontFamily: '',
      textAlign: ['left', 'center', 'right'], //文字的对齐方式，分为 left, center, right
      padding: 0,
      textDecoration: ['linethrough', 'overline', 'underline', 'linethrough'],
      hasBorder: [1, 1], //overline underline line-through 可组合
      borderRadius: 1,
      borderWidth: 1,
      borderColor: '#000000'
    }
  },
  {
    type: 'rect',
    name: '矩形',
    css: {
      ...commonProps,
      width: 200,
      top: 0,
      borderRadius: 0,
      borderWidth: 0,
      background: 'red',
      shadow: '' //阴影
    }
  },
  {
    type: 'image',
    name: '图片',
    css: {
      ...commonProps,
      mode: [/* 'default', 'scaleToFill',  */ 'aspectFill']
    }
  },
  {
    type: 'qrcode',
    name: '二维码',
    css: {
      ...commonProps,
      padding: '3'
    }
  }
];
