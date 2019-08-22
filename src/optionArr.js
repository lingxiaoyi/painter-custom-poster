let commonProps = {
  color: '#000000', //字体颜色 linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)
  background: '#538e60', //文字区域背景色
  bottom: 40, //优先取这个bottom top必须要有一个
  top: 40,
  right: 40, //优先取这个right left必须要有一个
  left: 40,
  width: 100,
  height: 200, //高度,没有的话就自适应
  rotate: 0,
  borderRadius: 50,
  borderWidth: 10,
  borderColor: '#000000',
  align: ['center', 'left', 'right'], //view 的对齐方式
  shadow: '10 10 5 #888888' //阴影
};
export default [
  {
    type: 'canvas',
    css: {
      width: '654',
      height: '1000',
      background: '#eee'
    }
  },
  {
    type: 'text',
    name: '文字',
    css: {
      ...commonProps,
      text: '我是来测试的阿发发萨芬撒发',
      fontSize: '30',
      fontWeight: 'bold', //文字加粗 可以不写
      maxLines: '', //最大行数
      lineHeight: '20',
      textStyle: ['fill', 'stroke'], //fill： 填充样式，stroke：镂空样式
      fontFamily: '',
      textAlign: ['center', 'left', 'right'], //文字的对齐方式，分为 left, center, right
      padding: '10',
      textDecoration: ['none', 'overline', 'underline', 'linethrough'],
      hasBorder: [0, 1] //overline underline line-through 可组合
    }
  },
  {
    type: 'rect',
    name: '矩形',
    css: {
      ...commonProps
    }
  },
  {
    type: 'image',
    name: '图片',
    css: {
      ...commonProps,
      mode: ['aspectFill', 'scaleToFill', 'aspectFill']
    }
  },
  {
    type: 'qrcode',
    name: '二维码',
    css: {
      ...commonProps
    }
  }
];
