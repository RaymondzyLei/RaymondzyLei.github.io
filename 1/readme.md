原项目作者：KAI GE

在此基础上进行二次修改  精简重构一下

项目简介：

一个精美的拟态风格个人主页，采用现代化的玻璃拟态设计和丰富的动画效果

主要特色：

视觉效果：
– 玻璃拟态：现代化的UI设计趋势

视觉设计：
– 玻璃拟态效果：半透明背景现代化的毛玻璃效果

动画效果：
– 樱花飘落：持续的樱花花瓣飘落动画，增添浪漫氛围

背景图片:

默认无图片

如果需要 创建一个img一个文件夹

然后修改css  在21行代码修改为  img/bg.jpg  或者使用 远程图片链接



# 如果无任何情况，请忽略以下代码

如果需要更自然的飘落效果，在278行代码 修改keyframes部分：

@keyframes falling {
0% {
transform: translate(0, 0) rotate(0deg);
}
100% {
transform: translate(var(--sway, 0), calc(100vh + 20px)) rotate(360deg);
}
}

以下是仅保留QQ号码和昵称功能的精简代码：

// 配置信息
const QQ\_NUMBER = '花有重开日 人无再少年';
const FIXED\_NICKNAME = "残月";

// 页面加载时更新信息
window.addEventListener('load', function() {
document.getElementById('qq-number').textContent = QQ\_NUMBER;
document.getElementById('contact-qq').textContent = QQ\_NUMBER;
document.getElementById('nickname').textContent = FIXED\_NICKNAME;
document.getElementById('footer-nickname').textContent = FIXED\_NICKNAME;
});

第二种方法

// 配置信息
const QQ\_NUMBER = '755108080';
const FIXED\_NICKNAME = "残月";

// 在所有相关元素中设置QQ号码
document.querySelectorAll('\[id="qq-number"], \[id="contact-qq"]').forEach(el => {
el.textContent = QQ\_NUMBER;
});

// 在所有相关元素中设置昵称
document.querySelectorAll('\[id="nickname"], \[id="footer-nickname"]').forEach(el => {
el.textContent = FIXED\_NICKNAME;
});

