import React, { Component } from "react";
import PropTypes from "prop-types";
import { throttle, merge } from "lodash";

import * as echarts from "echarts/lib/echarts";
import "echarts/lib/chart/line";
import "echarts/lib/chart/candlestick";
import "echarts/lib/component/gridSimple";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/legend";
import "echarts/lib/component/dataZoom";

class StockChart extends Component {
  constructor(props) {
    super(props);
    this.chart = null;
  }
  componentDidMount() {
    // 初始化图表
    this.chart = echarts.init(this.el);
    // 将传入的配置(包含数据)注入
    this.setOption();
    // 监听屏幕缩放，重新绘制 echart 图表
    window.addEventListener(
      "resize",
      throttle(() => {
        // 减少回流提高性能
        this.resize();
      }, 100)
    );
  }
  componentDidUpdate() {
    // 每次更新组件都重置
    this.setOption();
  }
  componentWillUnmount() {
    // 组件卸载前卸载图表
    window.removeEventListener("resize", this.resize);
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  }
  calculateMA(dayCount) {
    let result = [];
    const data = this.data;
    for (let i = 0, len = data.length; i < len; i++) {
      if (i < dayCount) {
        result.push("-");
        continue;
      }
      let sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += data[i - j][1];
      }
      result.push(Math.round((sum / dayCount) * 10000) / 10000);
    }
    return result;
  }
  get dates() {
    return this.props.dataset.map((item) => item[0]);
  }

  get data() {
    return this.props.dataset.map((item) => {
      return [
        +item[1],
        +item[2],
        +item[5],
        +item[6],
        +item[3],
        item[4],
        +item[7]
      ];
    });
  }

  getMas(ranges) {
    return ranges.map((item) => {
      return {
        name: "MA" + String(item),
        type: "line",
        data: this.calculateMA(item),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      };
    });
  }

  get series() {
    const arr = this.getMas([5, 10, 20, 30]);
    return [
      {
        type: "candlestick",
        name: this.props.seriesName,
        data: this.data,
        itemStyle: {
          color: "#FD1050",
          color0: "#0CF49B",
          borderColor: "#FD1050",
          borderColor0: "#0CF49B"
        }
      },
      ...arr
    ];
  }
  setOption() {
    this.chart.setOption(
      merge(
        {
          backgroundColor: "#21202D",
          legend: {
            data: this.series.map((item) => item.name),
            inactiveColor: "#777",
            textStyle: {
              color: "#fff"
            },
            top: "2%"
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              animation: false,
              type: "cross",
              lineStyle: {
                color: "#376df4",
                width: 1,
                opacity: 1
              }
            },
            formatter: ([param, ...tail]) => {
              const data = param.data;
              const float = data[4] - data[3];
              return (
                param.seriesName +
                "<br/>" +
                param.name +
                "<br/>开盘：" +
                data[1] +
                "<br/>最高：" +
                data[4] +
                "<br/>最低：" +
                data[3] +
                "<br/>收盘：" +
                data[2] +
                "<br/>涨跌：" +
                data[5] +
                "(" +
                data[6] +
                ")" +
                "<br/>成交：" +
                (data[7] / 100000000).toFixed(2) +
                "亿手" +
                "<br/>振幅：" +
                float.toFixed(2) +
                "(" +
                ((float / data[4]) * 100).toFixed(2) +
                "%)" +
                "<br/>" +
                tail
                  .map((item) => item.seriesName + "：" + item.value)
                  .join("<br/>")
              );
            }
          },
          xAxis: {
            type: "category",
            data: this.dates,
            axisLine: { lineStyle: { color: "#8392A5" } }
          },
          yAxis: {
            scale: true,
            axisLine: { lineStyle: { color: "#8392A5" } },
            splitLine: { show: false }
          },
          grid: {
            bottom: 80
          },
          dataZoom: [
            {
              textStyle: {
                color: "#8392A5"
              },
              handleIcon:
                "path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
              handleSize: "80%",
              dataBackground: {
                areaStyle: {
                  color: "#8392A5"
                },
                lineStyle: {
                  opacity: 0.8
                }
              },
              handleStyle: {
                shadowBlur: 3,
                shadowColor: "rgba(0, 0, 0, 0.6)",
                shadowOffsetX: 2,
                shadowOffsetY: 2
              }
            },
            {
              type: "inside"
            }
          ],
          animation: false,
          series: this.series
        },
        this.props.option
      ),
      true
    );
  }

  resize() {
    this.chart && this.chart.resize();
  }

  render() {
    return <div ref={(el) => (this.el = el)} className="stock-chart"></div>;
  }
}

export default StockChart;

StockChart.propTypes = {
  // 图表数据源
  dataset: PropTypes.arrayOf(PropTypes.array).isRequired,
  // K线系列名称
  seriesName: PropTypes.string,
  // 外部选项
  option: PropTypes.object
};
