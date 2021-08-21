/*
 * @Description: Auto.js百度贴吧自动签到脚本
 *                大部分代码都使用坐标定位点击和滑动，不是使用控件定位，
 *                ！！所以这份脚本代码不具有普适性！！
 * @Version: 0.1.0
 * @Author: Ultronxr
 * @Date: 2021-07-17 09:22:52
 * @LastEditors: Ultronxr
 * @LastEditTime: 2021-07-18 13:13:06
 */
/** 关键数据封装 */
var data = {
    // 百度贴吧APP包名
    tieba_app_package_name: "com.baidu.tieba",
    
    // 贴吧首页“进吧”按钮的坐标
    enter_btn : [315, 2212],
    
    // 贴吧列表中：最左上角的贴吧点击box坐标
    click_box : [280, 665],

    // 贴吧列表中：每个贴吧点击box在x方向（从左向右横向）的距离；
    //                           在y方向（从上至下纵向）的距离；
    //             y方向距离的空行程，即swipe这个值内的部分全是空行程，不会实际滚动
    box_x_gap : 530,
    box_y_gap : 170,
    box_y_gap_blank : 48,

    // 一个贴吧内“已签到”按钮宽度；“签到”按钮宽度
    signed_bounds_width : 1044-838,
    not_signed_bounds_width : 1044-854,
};

/** 滚动相关数据封装 */
var data_swipe = {
    // 一共有几行贴吧，即需要向下滚动几次
    cnt : 59,

    // 向下滚动（swipe）的起始和结束坐标
    start : [device.width/2, 1000],
    end : [device.width/2, 1000-(data.box_y_gap + data.box_y_gap_blank)],

    // 一次滚动的时间，单位ms
    time : 500,
};


launchTiebaApp();
if(isAtHomeTabPage()) {
    click(data.enter_btn[0], data.enter_btn[1]);
    toastAndLog("点击“进吧”按钮");
    sleep(1500);
} else {
    back(); back(); back(); back(); back();
    sleep(1500);
    launchTiebaApp();
    click(data.enter_btn[0], data.enter_btn[1]);
    toastAndLog("点击“进吧”按钮");
    sleep(1500);
}

// 点击进入第一行贴吧
console.log("===== 0 =====");
sign(data.click_box, 0, 0);
sign(data.click_box, data.box_x_gap, 0);

// 一边向下滚动，一边点击进入每一行贴吧
for(let i = 0; i < data_swipe.cnt; ++i) {
    console.log("===== " + (i+1) + " =====");
    swipe(data_swipe.start[0], data_swipe.start[1], 
            data_swipe.end[0], data_swipe.end[1], 
            data_swipe.time);
    sign(data.click_box, 0, 0);
    sign(data.click_box, data.box_x_gap, 0);
}

/**
 * 执行签到逻辑的方法
 * @param {[x,y]}   box     初始点击box坐标
 * @param {integer} delta_x x方向的∆距离
 * @param {integer} delta_y y方向的∆距离
 */
function sign(box, delta_x, delta_y) {
    click(box[0] + delta_x, box[1] + delta_y);
    sleep(2000);

    // 点击进入某个贴吧后，判断最大的贴吧标题是否存在
    if(hasForumName()) {
        // 存在最大的贴吧标题
        // 注意：贴吧被封了也存在贴吧标题，所以也在这个if分支下
        var name = id("forum_name").findOnce().text() + "：";
        if(!hasSignBtn()) {
            toastAndLog(name + "无签到按钮");
            backAndSleep(500);
            return;
        }
    } else {
        // 不存在最大的贴吧标题，即点进贴吧页面后弹出了广告，或者点进了预期之外的非贴吧页面
        toastAndLog("这里啥都没有");
        backAndSleep(500);
        
        // 判断返回到了什么页面
        if(hasSignBtn()) {
            // 出现了签到按钮，即刚刚弹出了广告，返回一次把广告关闭了
            toastAndLog(name + "出现了签到按钮");
        } else if(isAtHomeTabPage()) {
            // 返回到了首页，即刚刚点入了预期之外的非贴吧页面，直接return
            return;
        }
    }

    // 进行签到
    id("tv_sign").waitFor();
    if(isSignBtnSigned()) {
        id("tv_sign").findOne().click();
        toastAndLog(name + "点击签到按钮");
    } else {
        toastAndLog(name + "已签到");
    }
    backAndSleep(500);
}

/**
 * 启动百度贴吧APP
 */
function launchTiebaApp() {
    app.launch(data.tieba_app_package_name);
    toastAndLog("启动百度贴吧");
    sleep(5000);
}

/**
 * 检查当前是否处于首页（贴吧列表页），即底部有“进吧”按钮
 * @returns true/false
 */
function isAtHomeTabPage() {
    return id("view_bottom_text").textContains("进吧").exists();
}

/**
 * 检查进入某一个贴吧后，最大的贴吧标题是否存在（点进了一个其他非贴吧页面）
 * @returns true/false
 */
function hasForumName() {
    return id("forum_name").exists();
}

/**
 * 检查当前页是否存在签到按钮（包含未签到和已签到按钮）
 * 注意：这个函数不判断是否已签到
 * @returns true/false
 */
function hasSignBtn() {
    return id("tv_sign").exists();
}

/**
 * 判断签到按钮是否已签到
 * 注意：调用这个函数的前提是签到按钮存在
 * @returns true/false
 */
function isSignBtnSigned() {
    let bound = id("tv_sign").findOne().bounds();
    return (bound.right - bound.left == data.not_signed_bounds_width);
}

function toastAndLog(msg) {
    toast(msg);
    console.log(msg);
}

function backAndSleep(ms) {
    back();
    sleep(ms);
}
