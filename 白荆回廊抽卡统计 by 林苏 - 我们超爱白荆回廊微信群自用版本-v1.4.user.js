// ==UserScript==
// @name         白荆回廊抽卡统计 by 林苏 - 我们超爱白荆回廊微信群自用版本
// @namespace    http://tampermonkey.net/
// @version      v1.4
// @description  我们超爱白荆回廊群自用版本，由天墉城海临办事处、流月城海临办事处、光明野海临办事处提供赞助！
// @author       林苏
// @match        https://seed.qq.com/act/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=qq.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @sign         211c8fab707579bf
// ==/UserScript==
// changeLog
//  v1.0 增加角色卡池数据统计
//  v1.1 修复68元一次性卡池算入up池的bug
//  v1.2 增加烙痕卡池统计；增加垫数统计
//  v1.3 烙痕总抽数区分友情池
//  v1.4 区分卡池抽数统计；增加不歪率统计；增加平均抽数统计

let queryPoolConfigUrl = "https://seed.qq.com/act/a20240905record/pc/json/pool.json";
let queryRoleConfigUrl = "https://seed.qq.com/act/a20240905record/pc/json/concordant.json";
let queryCardConfigUrl = "https://seed.qq.com/act/a20240905record/pc/json/soldering_mark.json";
let queryDataUrl = "https://comm.ams.game.qq.com/ide/";

let nickName = $('#nickName').text();
let nowDate = getFormattedDate();
let currentCookies = document.cookie;

let poolInfo;
let roleInfo;
let cardInfo;

let poolUpConfig = '{"12":{"up":"602"},"14":{"up":"618"},"15":{"up":"626"},"17":{"up":"623"},"18":{"up":"622"},"20":{"up":"624"},"21":{"up":"610"},"24":{"up":"603"},"26":{"up":"630"},"28":{"up":"628"},"31":{"up":"631"},"33":{"up":"632"},"35":{"up":"611"},"37":{"up":"634"},"39":{"up":"633"}}';

let poolUpInfo = JSON.parse(poolUpConfig);

let specialFileds = "total,normalTotal,upTotal,specialTotal,sixTotal,fiveTotal,normalUsedNum,upUsedNum,upSixTotal,nowUpSixTotal";

(function () {
    queryConfig().then(() => {
        createTag();
    });
})();

function createTag() {
    $('#login').each(function () {
        $(this).find('a').last().after('<a id="roleCount" style="cursor: pointer;">【角色统计】</a>');
        $(this).find('a').last().after('<a id="cardCount" style="cursor: pointer;">【烙痕统计】</a>');
    });
    $('#roleCount').click(function (event) {
        alert("正在查询所有角色数据，然后导出统计结果，点击确定后等待即可，不必重复点击")
        createRoleCountPage();
    });
    $('#cardCount').click(function (event) {
        alert("正在查询所有烙痕数据，然后导出统计结果，点击确定后等待即可，不必重复点击")
        createCardCountPage();
    });
}

function createRoleCountPage() {
    queryAllRoleData().then(rolePools => {
        // 六星平均抽
        let sixAverage = ((rolePools.normalTotal + rolePools.upTotal) / (rolePools.sixTotal - 1)).toFixed(2);
        // up六星平均抽
        let upSixAverage = (rolePools.upTotal / rolePools.nowUpSixTotal).toFixed(2);
        // up六星不歪率
        let upSixProbability = ((rolePools.nowUpSixTotal / rolePools.upSixTotal) * 100).toFixed(2) + '%';

        let poolHtml = '';
        Object.keys(rolePools)
              .forEach(key => {
                  if (!specialFileds.includes(key)) {
                      let sixRoles = rolePools[key].sixList;
                      let poolTbody = '';
                      sixRoles.forEach(sixRole => {
                          poolTbody += `<tr><th>${sixRole.getOrder}</th><th>${sixRole.name}</th><th>${sixRole.usedNum}</th></tr>`;
                      })
                      let poolTable = `<div class="panel panel-default" id="${key}"><div class="panel-heading">${rolePools[key].name}</div><table class="table"><thead><tr><th>获得顺序</th><th>角色</th><th>所用抽数</th></tr><tbody>${poolTbody}</tbody></thead></table></div>`;
                      poolHtml += poolTable;
                  }
              })

        let countHtml = `<div class="panel panel-default"><div class="panel-heading">统计数据概览</div><table class="table"><thead><tr><th>总抽数</th><th>常态池抽数</th><th>UP池抽数</th><th>特殊卡池抽数</th><th>六星数量</th><th>五星数量</th><th>UP不歪率</th><th>常态池已垫抽数</th><th>UP池已垫抽数</th><th>获取六星平均抽数</th><th>获取六星(UP)平均抽数</th><th>标签</th></tr></thead><tbody><tr><th>${rolePools.total}</th><th>${rolePools.normalTotal}</th><th>${rolePools.upTotal}</th><th>${rolePools.specialTotal}</th><th>${rolePools.sixTotal}</th><th>${rolePools.fiveTotal}</th><th>${upSixProbability}</th><th>${rolePools.normalUsedNum}</th><th>${rolePools.upUsedNum}</th><th>${sixAverage}</th><th>${upSixAverage}</th><th>待开发</th></tr></tbody></table></div>`;

        let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>白荆回廊抽卡统计by林苏-我们超爱白荆回廊自用版本</title><link rel="stylesheet"href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css"integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu"crossorigin="anonymous"><script src="https://code.jquery.com/jquery-3.7.1.min.js"integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="crossorigin="anonymous"></script><script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/3.4.1/js/bootstrap.min.js"integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd"crossorigin="anonymous"></script></head><body><div id="main"><div class="panel panel-default"><div class="panel-heading">角色卡池</div><div class="panel-body"><div class="panel panel-default"><div class="panel-heading">作者说明</div><div class="panel-body"><ul><li>总抽数一项包含所有卡池抽数（常态池、up池、68元一次性卡池/友情烙痕池）。</li><li>六星/SSR数量不包含赠送的自选六星，但角色数量里包含了68元一次性卡池获取的六星。</li><li>六星/SSR平均抽计算方式：（常态池总抽数+up池总抽数）/总六星数量(计算六星角色时会-1)。</li><li>六星(UP)/SSR(UP)平均抽计算方式：up池总抽数/up池获取的up数量。</li><li>不歪率计算方式：（up池获取的up数量/up池获取的总六星/ssr数量）*100（%）</li><li>常态池垫数为所有常态卡池包括常态UP卡池共用，UP池垫数为所有UP卡池共用。</li><br><li>不管怎么说，我们卡洛琳天下第一好！</li><li>本程序由天墉城海临办事处(18896499)、流月城海临办事处(26085314)、光明野海临办事处(26695651)友情支持。</li><li>本程序由监督林苏(28266118)开发，用于”我们超爱白荆回廊“群自娱自乐，不禁止二次传播，但不可用于任何商业用途；本程序为纯粹的本地浏览器脚本，不会上传任何数据至服务器，使用皆为烛龙官方开放接口，可放心使用。</li><br><li>最新脚本下载地址：https://seed.linsusu.cn</li></ul></div></div>${countHtml}${poolHtml}</div></div></div></body></html>`;

        // 自动保存为新页面
        var blob = new Blob([html], {type: 'text/html'});
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `角色池统计结果_${nickName}_${nowDate}.html`; // 文件名
        setTimeout(() => link.click(), 100); // 延迟确保 DOM 更新
    })
}

function createCardCountPage() {
    queryAllCardData().then(cardPools => {
        // 六星平均抽
        let sixAverage = ((cardPools.normalTotal + cardPools.upTotal) / (cardPools.sixTotal)).toFixed(2);
        // up六星平均抽
        let upSixAverage = (cardPools.upTotal / cardPools.nowUpSixTotal).toFixed(2);
        // up六星不歪率
        let upSixProbability = ((cardPools.nowUpSixTotal / cardPools.upSixTotal) * 100).toFixed(2) + '%';

        let poolHtml = '';

        Object.keys(cardPools)
              .forEach(key => {
                  if (!specialFileds.includes(key)) {
                      //卡池列表内容
                      let poolTbody = '';
                      if (cardPools[key].name.includes("海域同游")) {
                          let fiveCards = cardPools[key].fiveList;
                          fiveCards.forEach(fiveCard => {
                              poolTbody += `<tr><th>${fiveCard.getOrder}</th><th>${fiveCard.name}</th><th>${fiveCard.usedNum}</th></tr>`;
                          })
                      } else {
                          let sixCards = cardPools[key].sixList;
                          sixCards.forEach(sixCard => {
                              poolTbody += `<tr><th>${sixCard.getOrder}</th><th>${sixCard.name}</th><th>${sixCard.usedNum}</th></tr>`;
                          })
                      }
                      let poolTable = `<div class="panel panel-default" id="${key}"><div class="panel-heading">${cardPools[key].name}</div><table class="table"><thead><tr><th>获得顺序</th><th>烙痕</th><th>所用抽数</th></tr><tbody>${poolTbody}</tbody></thead></table></div>`;
                      poolHtml += poolTable;
                  }
              })

        let countHtml = `<div class="panel panel-default"><div class="panel-heading">统计数据概览</div><table class="table"><thead><tr><th>总抽数</th><th>常态池抽数</th><th>UP池抽数</th><th>友情池抽数</th><th>SSR数量</th><th>SR数量</th><th>UP不歪率</th><th>常态池已垫抽数</th><th>UP池已垫抽数</th><th>获取SSR平均抽数</th><th>获取SSR(UP)平均抽数</th><th>标签</th></tr></thead><tbody><tr><th>${cardPools.total}</th><th>${cardPools.normalTotal}</th><th>${cardPools.upTotal}</th><th>${cardPools.specialTotal}</th><th>${cardPools.sixTotal}</th><th>${cardPools.fiveTotal}</th><th>${upSixProbability}</th><th>${cardPools.normalUsedNum}</th><th>${cardPools.upUsedNum}</th><th>${sixAverage}</th><th>${upSixAverage}</th><th>待开发</th></tr></tbody></table></div>`;

        let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>白荆回廊抽卡统计by林苏-我们超爱白荆回廊自用版本</title><link rel="stylesheet"href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css"integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu"crossorigin="anonymous"><script src="https://code.jquery.com/jquery-3.7.1.min.js"integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="crossorigin="anonymous"></script><script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/3.4.1/js/bootstrap.min.js"integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd"crossorigin="anonymous"></script></head><body><div id="main"><div class="panel panel-default"><div class="panel-heading">烙痕卡池</div><div class="panel-body"><div class="panel panel-default"><div class="panel-heading">作者说明</div><div class="panel-body"><ul><li>总抽数一项包含所有卡池抽数（常态池、up池、68元一次性卡池/友情烙痕池）。</li><li>六星/SSR数量不包含赠送的自选六星，但角色数量里包含了68元一次性卡池获取的六星。</li><li>六星/SSR平均抽计算方式：（常态池总抽数+up池总抽数）/总六星数量(计算六星角色时会-1)。</li><li>六星(UP)/SSR(UP)平均抽计算方式：up池总抽数/up池获取的up数量。</li><li>不歪率计算方式：（up池获取的up数量/up池获取的总六星/ssr数量）*100（%）</li><li>常态池垫数为所有常态卡池包括常态UP卡池共用，UP池垫数为所有UP卡池共用。</li><br><li>不管怎么说，我们卡洛琳天下第一好！</li><li>本程序由天墉城海临办事处(18896499)、流月城海临办事处(26085314)、光明野海临办事处(26695651)友情支持。</li><li>本程序由监督林苏(28266118)开发，用于”我们超爱白荆回廊“群自娱自乐，不禁止二次传播，但不可用于任何商业用途；本程序为纯粹的本地浏览器脚本，不会上传任何数据至服务器，使用皆为烛龙官方开放接口，可放心使用。</li><br><li>最新脚本下载地址：https://seed.linsusu.cn</li></ul></div></div>${countHtml}${poolHtml}</div></div></div></body></html>`;

        // 自动保存为新页面
        var blob = new Blob([html], {type: 'text/html'});
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `烙痕池统计结果_${nickName}_${nowDate}.html`; // 文件名
        setTimeout(() => link.click(), 100); // 延迟确保 DOM 更新
    })
}

// 更新卡池配置、角色配置、烙痕配置
async function queryConfig() {
    await $.get(queryPoolConfigUrl, function (resp) {
        console.log("----------------------------------------")
        console.log(resp);
        poolInfo = JSON.parse(resp);
    })

    await $.get(queryRoleConfigUrl, function (resp) {
        console.log("----------------------------------------")
        console.log(resp);
        roleInfo = JSON.parse(resp);
    })

    await $.get(queryCardConfigUrl, function (resp) {
        console.log("----------------------------------------")
        console.log(resp);
        cardInfo = JSON.parse(resp);
    })
}

async function queryAllRoleData() {
    let currentDate = new Date();
    let currentTimestamp = Math.floor(Date.now() / 1000)
    console.log(`当前时间：${currentDate} - ${currentTimestamp}`);

    let startDate = new Date('2024-01-01T00:00:00');
    let startTimestamp = Math.floor(startDate.getTime() / 1000);

    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    let endTimestamp = Math.floor(endDate.getTime() / 1000);

    let whileNum = 1;
    let flag = true;

    let roleRecodes = {};

    do {
        // 如果截止时间大于当前日期,使用当前日期作为截止时间
        if (endTimestamp > currentTimestamp) {
            endTimestamp = currentTimestamp;
            flag = false;
        }
        console.log(`第${whileNum}次，起始时间：${startDate} - ${startTimestamp}`)
        console.log(`第${whileNum}次，结束时间：${endDate} - ${endTimestamp}`)
        // 阻塞获取所有角色卡池记录
        await $.ajax({
            url: queryDataUrl,
            type: 'POST',
            data: `iChartId=323543&iSubChartId=323543&sIdeToken=mhi97c&e_code=0&g_code=0&eas_url=http%253A%252F%252Fseed.qq.com%252Fact%252Fa20240905record%252F&eas_refer=http%253A%252F%252Fseed.qq.com%252Fact%252Fa20240905record%252F%253Freqid%253D61f42185-88e0-4635-9eb9-2ec183a7ede2%2526version%253D27&sMiloTag=AMS-bjhl-1010111534-f37R5S-666158-1067503&startTime=${startTimestamp}&endTime=${endTimestamp}&isPreengage=1&needGopenid=1`,
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Cookie', currentCookies);
            },
            success: function (httpResponse) {
                console.log(`原始响应报文记录：${httpResponse}`)

                let resp = JSON.parse(httpResponse);
                let tempRoleRecodes = resp.jData.data;

                Object.keys(tempRoleRecodes)
                      .forEach(key => {
                          if (tempRoleRecodes[key].length !== 0) {
                              roleRecodes[key] = [];
                              tempRoleRecodes[key].sort((a, b) => a.time.localeCompare(b.time))
                                                  .forEach(tempRoleRecode => {
                                                      roleRecodes[key].push(tempRoleRecode)
                                                  });
                          }
                      })
            },
            error: function (xhr, status, error) {
                console.log('Error:', error);
            }
        });
        // 下一次查询起始时间
        startDate.setDate(startDate.getDate() + 30);
        startTimestamp = Math.floor(startDate.getTime() / 1000);
        // 下一次查询截止时间
        endDate.setDate(endDate.getDate() + 30);
        endTimestamp = Math.floor(endDate.getTime() / 1000);

        whileNum++;
    } while (flag);
    console.log("-------------------角色池有效数据总条数 begin -------------------")
    console.log(JSON.stringify(roleRecodes));
    console.log("-------------------角色池有效数据总条数 end ---------------------")
    // 卡池总数据
    let rolePools = {
        total: 0,//总抽数
        normalTotal: 0,//常态池总抽数
        upTotal: 0,//up池总抽数
        specialTotal: 0,//特殊卡池总抽数

        sixTotal: 0,//获取的六星数量
        fiveTotal: 0,//获取的五星数量

        normalUsedNum: 0,//常态池已垫抽数
        upUsedNum: 0,//up池已垫抽数

        upSixTotal: 0,//up池获取的所有六星数量
        nowUpSixTotal: 0,//up池获取的档当期六星数量
    };
    // 垫数记录
    let usedNum = {
        // 特殊的限域巡回卡池
        special: {
            six: 0,//六星数量
            five: 0,//五星数量
        },
        // 常态卡池
        normal: {
            six: 0,//六星数量
            five: 0,//五星数量
        },
        // up卡池
        up: {
            six: 0,//六星数量
            five: 0,//五星数量
        }
    }
    // 按日期遍历抽卡记录
    Object.keys(roleRecodes)
          .forEach(key => {
              for (let role of roleRecodes[key]) {
                  // 获取当前卡池up
                  let up = '';
                  if (poolUpInfo[role.poolId]) {
                      up = roleInfo[poolUpInfo[role.poolId].up].name;
                  }
                  // 如果当前卡池数据不存在，新增
                  if (!rolePools[role.poolId]) {
                      rolePools[role.poolId] = {
                          id: role.poolId,//卡池ID
                          name: poolInfo[role.poolId].name, //卡池名称
                          up: up,//卡池up
                          sixNum: 0, // 当前卡池获取的六星数量，并用于获取顺序
                          sixList: [], // 获取的六星列表
                          fiveNum: 0,// 当前卡池获取的六星数量，并用于获取顺序
                          fiveList: [],//获取的五星列表
                      };
                  }
                  // 构造当前角色数据
                  let nowRole = {
                      tid: role.tid,
                      rarity: roleInfo[role.tid].rarity, // 星级
                      name: roleInfo[role.tid].name, // 名称
                      time: role.time,// 获取时间
                      getOrder: 0,// 获取顺序
                      usedNum: 0,// 所用抽数
                  }

                  // 当前卡池信息
                  let nowPool = rolePools[role.poolId];
                  // 当前卡池名称
                  let nowPoolName = poolInfo[role.poolId].name;

                  console.log(`当前卡池信息：${JSON.stringify(nowPool)},up:${nowPool.up}`)
                  console.log(`当前角色信息：${JSON.stringify(nowRole)}`)

                  // 总数量+1
                  rolePools.total++;
                  // 常态池垫数计算
                  if (nowPoolName.includes("常态")) {
                      usedNum.normal.six++;
                      usedNum.normal.five++;
                      rolePools.normalTotal++;
                  }
                  // 特殊池子垫数计算
                  else if (nowPoolName.includes("限域巡回")) {
                      usedNum.special.six++;
                      usedNum.special.five++;
                      rolePools.specialTotal++;
                  }
                  // 其它卡池默认为up池垫数计算
                  else {
                      usedNum.up.six++;
                      usedNum.up.five++;
                      rolePools.upTotal++;
                  }
                  // 六星处理
                  if (nowRole.rarity === "6") {
                      // 获取的总六星角色数量+1
                      rolePools.sixTotal++;
                      // 当前卡池六星角色数量+1
                      nowPool.sixNum++;
                      // 当前角色的获取顺序
                      nowRole.getOrder = nowPool.sixNum;
                      // 不同卡池处理
                      if (nowPoolName.includes("常态")) {
                          nowRole.usedNum = usedNum.normal.six;
                          usedNum.normal.six = 0;
                      } else if (nowPoolName.includes("限域巡回")) {
                          nowRole.usedNum = usedNum.special.six;
                          usedNum.special.six = 0;
                      } else {
                          nowRole.usedNum = usedNum.up.six;
                          usedNum.up.six = 0;
                          rolePools.upSixTotal++;
                          if (nowRole.name.includes(nowPool.up)) {
                              rolePools.nowUpSixTotal++;
                          }
                      }
                      nowPool.sixList.push(nowRole);
                  }
                  // 五星处理
                  else if (nowRole.rarity === "5") {
                      rolePools.fiveTotal++;
                      rolePools[role.poolId].fiveNum++;
                      nowRole["getRoleOrder"] = nowPool.fiveNum;
                      if (nowPoolName.includes("常态")) {
                          nowRole.usedNum = usedNum.normal.five;
                          usedNum.normal.five = 0;
                      } else if (nowPoolName.includes("限域巡回")) {
                          nowRole.usedNum = usedNum.special.six;
                          usedNum.special.five = 0;
                      } else {
                          nowRole.usedNum = usedNum.up.five;
                          usedNum.up.five = 0;
                      }
                      nowPool.fiveList.push(nowRole);
                  }
              }
          })
    rolePools.normalUsedNum = usedNum.normal.six;
    rolePools.upUsedNum = usedNum.up.six;
    console.log(`${JSON.stringify(rolePools)}`)
    return rolePools;
}

// 查询所有烙痕数据
async function queryAllCardData() {
    let currentDate = new Date();
    let currentTimestamp = Math.floor(Date.now() / 1000)
    console.log(`当前时间：${currentDate} - ${currentTimestamp}`);

    let startDate = new Date('2024-01-01T00:00:00');
    let startTimestamp = Math.floor(startDate.getTime() / 1000);

    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    let endTimestamp = Math.floor(endDate.getTime() / 1000);

    let whileNum = 1;
    let flag = true;

    let cardRecodes = {};

    do {
        // 如果截止时间大于当前日期,使用当前日期作为截止时间
        if (endTimestamp > currentTimestamp) {
            endTimestamp = currentTimestamp;
            flag = false;
        }
        console.log(`第${whileNum}次，起始时间：${startDate} - ${startTimestamp}`)
        console.log(`第${whileNum}次，结束时间：${endDate} - ${endTimestamp}`)
        await $.ajax({
            url: queryDataUrl,
            type: 'POST',
            data: `iChartId=323691&iSubChartId=323691&sIdeToken=Q4rDBY&e_code=0&g_code=0&eas_url=http%253A%252F%252Fseed.qq.com%252Fact%252Fa20240905record%252F&eas_refer=http%253A%252F%252Fnoreferrer%252F%253Freqid%253D3df01c1c-6b8d-4dd8-83ac-66f88ea20694%2526version%253D27&sMiloTag=AMS-bjhl-1011171748-LPbNU2-666158-1067627&startTime=${startTimestamp}&endTime=${endTimestamp}&isPreengage=1&needGopenid=1`,
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Cookie', currentCookies);
            },
            success: function (httpResponse) {
                console.log(`原始响应报文记录：${httpResponse}`)

                let resp = JSON.parse(httpResponse);
                let tempCardRecodes = resp.jData.data;

                Object.keys(tempCardRecodes).forEach(key => {
                    if (tempCardRecodes[key].length !== 0) {
                        cardRecodes[key] = [];
                        tempCardRecodes[key].sort((a, b) => a.time.localeCompare(b.time))
                                            .forEach(tempCardRecode => {
                                                cardRecodes[key].push(tempCardRecode)
                                            });
                    }
                })
            },
            error: function (xhr, status, error) {
                console.log('Error:', error);
            }
        });
        // 下一次查询起始时间
        startDate.setDate(startDate.getDate() + 30);
        startTimestamp = Math.floor(startDate.getTime() / 1000);
        // 下一次查询截止时间
        endDate.setDate(endDate.getDate() + 30);
        endTimestamp = Math.floor(endDate.getTime() / 1000);

        whileNum++;
    } while (flag);

    console.log("-------------------烙痕池有效数据总条数 begin -------------------")
    console.log(JSON.stringify(cardRecodes));
    console.log("-------------------烙痕池有效数据总条数 end ---------------------")

    // 卡池总数据
    let cardPools = {
        total: 0,//总抽数
        normalTotal: 0,//常态池总抽数
        upTotal: 0,//up池总抽数
        specialTotal: 0,//特殊卡池总抽数

        sixTotal: 0,//获取的六星数量
        fiveTotal: 0,//获取的五星数量

        normalUsedNum: 0,//常态池已垫抽数
        upUsedNum: 0,//up池已垫抽数

        upSixTotal: 0,//up池获取的所有六星数量
        nowUpSixTotal: 0,//up池获取的档当期六星数量
    };
    // 垫数记录
    let usedNum = {
        // 特殊卡池
        hy: {
            six: 0,//六星数量
            five: 0,//五星数量
        },
        // 常态卡池
        normal: {
            six: 0,//六星数量
            five: 0,//五星数量
        },
        // up卡池
        up: {
            six: 0,//六星数量
            five: 0,//五星数量
        }
    }
    // 按日期遍历抽卡记录
    Object.keys(cardRecodes)
          .forEach(key => {
              for (let card of cardRecodes[key]) {
                  // 如果当前卡池数据不存在，新增
                  if (!cardPools[card.poolId]) {
                      cardPools[card.poolId] = {
                          id: card.poolId,//卡池ID
                          name: poolInfo[card.poolId].name, //卡池名称
                          up: poolInfo[card.poolId].name,//卡池up
                          sixNum: 0, // 当前卡池获取的6星角色数量，并用于获取顺序
                          sixList: [], // 获取的6星角色列表
                          fiveNum: 0,// 当前卡池获取的6星角色数量，并用于获取顺序
                          fiveList: [],//五星角色列表
                      };
                  }
                  // 构造当前数据
                  let nowCard = {
                      tid: card.tid,
                      rarity: cardInfo[card.tid].rarity, // 星级
                      name: cardInfo[card.tid].name, // 名称
                      time: card.time,// 获取时间
                      getOrder: 0,
                      usedNum: 0,
                  }

                  // 当前卡池信息
                  let nowPool = cardPools[card.poolId];
                  // 当前卡池名称
                  let nowPoolName = nowPool.name;

                  console.log(`当前卡池信息：${JSON.stringify(nowPool)},up:${nowPool.up}`)
                  console.log(`当前烙痕信息：${JSON.stringify(nowCard)}`)

                  cardPools.total++;
                  // 常态池垫数计算
                  if (nowPoolName.includes("寻迹")) {
                      usedNum.normal.six++;
                      usedNum.normal.five++;
                      cardPools.normalTotal++;
                  }
                  // 特殊池子垫数计算
                  else if (nowPoolName.includes("海域同游")) {
                      usedNum.hy.six++;
                      usedNum.hy.five++;
                      cardPools.specialTotal++;
                  }
                  // 其它卡池默认为up池垫数计算
                  else {
                      usedNum.up.six++;
                      usedNum.up.five++;
                      cardPools.upTotal++;
                  }
                  // SSR处理
                  if (nowCard.rarity === "3") {
                      // 获取的总六星数量+1
                      cardPools.sixTotal++;
                      // 当前卡池六星数量+1
                      nowPool.sixNum++;
                      // 获取顺序
                      nowCard.getOrder = nowPool.sixNum;
                      // 不同卡池处理
                      if (nowPoolName.includes("寻迹")) {
                          // 获取当前角色所使用的抽数
                          nowCard.usedNum = usedNum.normal.six;
                          usedNum.normal.six = 0;
                      } else if (nowPoolName.includes("海域同游")) {
                          nowCard.usedNum = usedNum.hy.six;
                          usedNum.hy.six = 0;
                      } else {
                          nowCard.usedNum = usedNum.up.six;
                          usedNum.up.six = 0;
                          cardPools.upSixTotal++;
                          if (nowCard.name.includes(nowPool.up)) {
                              cardPools.nowUpSixTotal++;
                          }
                      }
                      nowPool.sixList.push(nowCard);
                  }
                  // 五星处理
                  else if (nowCard.rarity === "2") {
                      cardPools.fiveTotal++;
                      cardPools[card.poolId].fiveNum++;
                      nowCard.getOrder = nowPool.fiveNum;
                      if (nowPoolName.includes("寻迹")) {
                          nowCard.usedNum = usedNum.normal.five;
                          usedNum.normal.five = 0;
                      } else if (nowPoolName.includes("海域同游")) {
                          nowCard.usedNum = usedNum.hy.five;
                          usedNum.hy.five = 0;
                      } else {
                          nowCard.usedNum = usedNum.up.five;
                          usedNum.up.five = 0;
                      }
                      nowPool.fiveList.push(nowCard);
                  }
              }
          })
    cardPools.normalUsedNum = usedNum.normal.six;
    cardPools.upUsedNum = usedNum.up.six;
    console.log(`${JSON.stringify(cardPools)}`)
    return cardPools;
}

function getFormattedDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
