import _ from 'lodash';
let optionArr = [
  {
    type: 'canvas',
    name: '画布',
    css: {
      width: '654',
      height: '1000',
      backgroundColor: '#f8f8f8',
      times: '1'
    }
  },
  {
    type: 'text',
    name: '文字',
    css: {
      text: '别跟我谈感情，谈感情伤钱。',
      width: 200,
      maxLines: 2, //最大行数
      lineHeight: 1.3,//行间距
      left: 0,
      top: 0,
      color: '#ff0000',
      background: 'rgba(0,0,0,0)',
      fontSize: 30,
      fontWeight: ['normal', 'bold'], //文字加粗 可以不写
      textDecoration: ['none', 'overline', 'underline', 'linethrough'], //overline underline line-through 可组合
      rotate: 0,
      //padding: 0,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: '#000000',
      shadow: '  10 10    5    #888888   ',
      textStyle: ['fill', 'stroke'], //fill： 填充样式，stroke：镂空样式
      textAlign: ['left', 'center', 'right'], //文字的对齐方式，分为 left, center, right
      fontFamily: '' //
    }
  },
  {
    type: 'rect',
    name: '矩形',
    css: {
      //background: 'linear-gradient(280deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)',
      //background: 'radial-gradient(rgba(0, 0, 0, 0) 5%, #0ff 15%, #f0f 60%)',
      width: 200,
      height: 122, //高度,没有的话就自适应
      left: 202,
      top: 0,
      background: '#ffffff',
      rotate: 0,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: '#ff0000',
      shadow: '10 10 5 #888888' //阴影
    }
  },
  {
    type: 'image',
    name: '图片',
    css: {
      url: 'https://operate.maiyariji.com/20190709%2F3da002983292a6950a71ca7392a21827.jpg',
      mode: ['scaleToFill', 'aspectFill', 'auto'],
      width: 100,
      height: 100, //高度,没有的话就自适应
      left: 0,
      top: 0,
      rotate: 0,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: '#000000',
      shadow: '10 10 5 #888888' //阴影
    }
  },
  {
    type: 'qrcode',
    name: '二维码',
    css: {
      url: '哈哈哈',
      width: 200,
      left: 0,
      top: 135,
      color: '#000000', //字体颜色 linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)
      background: '#ffffff', //文字区域背景色
      rotate: 0,
      borderRadius: 10/* ,
      borderWidth: 0,
      borderColor: '#000000', */
      //align: ['center', 'left', 'right'], //view 的对齐方式
      //padding: '3'
    }
  }
];

//得到当前默认信息
let newOptionArr = _.cloneDeep(optionArr);
newOptionArr[1].css.textStyle = newOptionArr[1].css.textStyle[0];
newOptionArr[1].css.textAlign = newOptionArr[1].css.textAlign[0];
newOptionArr[1].css.fontWeight = newOptionArr[1].css.fontWeight[0];
newOptionArr[1].css.textDecoration = newOptionArr[1].css.textDecoration[0];
newOptionArr[3].css.mode = newOptionArr[3].css.mode[0];
export { optionArr, newOptionArr };
