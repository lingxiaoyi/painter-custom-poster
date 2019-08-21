let commonProps = {
  color: 'yellow', //字体颜色 linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)
  bottom: '40rpx', //优先取这个bottom top必须要有一个
  top: '40rpx',
  right: '40rpx', //优先取这个right left必须要有一个
  left: '40rpx',
  width: '100rpx',
  height: '100rpx', //高度,没有的话就自适应
  rotate: '',
  borderRadius: '50rpx',
  borderWidth: '10rpx',
  borderColor: 'yellow',
  align: 'center', //view 的对齐方式
  shadow: '10rpx 10rpx 5rpx #888888' //阴影
};
export default {
  canvas: {
    width: '654rpx',
    height: '1000rpx',
    background: '#eee'
  },
  text: {
    text: '我是把width设置为400rpx后，我就换行了xx行了',
    css: {
      background: '#538e60', //文字区域背景色
      fontSize: '16rpx',
      fontWeight: 'bold', //文字加粗 可以不写
      maxLines: '', //最大行数
      lineHeight: '20rpx',
      textStyle: 'fill', //fill： 填充样式，stroke：镂空样式
      fontFamily: '',
      textAlign: 'center', //文字的对齐方式，分为 left, center, right
      padding: '10rpx',
      width: '100rpx',
      height: '100rpx', //高度,没有的话就自适应
      textDecoration: '', //overline underline line-through 可组合
    }
  },
  rect: {
    css: {
      ...commonProps
    }
  },
  image: {
    content: 'https://github.com/Kujiale-Mobile/Painter',
    css: {

    }
  },
  qrcode: {
    content: 'https://github.com/Kujiale-Mobile/Painter',
    css: {

    }
  },
};
