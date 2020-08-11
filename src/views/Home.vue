<template>
  <el-container class="container" id="work-container">
    <el-aside :width="asideWidth+'px'">
      <div class="box-card">
        <div class="card-header">流程分支</div>
        <div class="card-body">
          <div class="item" v-for="(item,index) in stepList" :key="index">
            <div
              class="chart-item"
              :data-id="item.id"
              :data-key="item.key"
              type="primary"
            >{{item.name}}</div>
          </div>
          <el-button type="primary" @click="saveStep()">保存流程</el-button>
        </div>
      </div>
    </el-aside>
    <el-main>
      <div class="workplace" id="workplace">
        <div
          v-for="(item,index) in connectionNodes"
          :key="index"
          :id="item.id"
          :style="{position:'absolute',top:item.nodeStyle.top+'px',left:item.nodeStyle.left+'px'}"
          class="chart-item"
        >{{item.text}}</div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import "jquery-ui-dist/jquery-ui";
import "jquery-ui-dist/jquery-ui.css";
import jsplumb from "jsplumb";

export default {
  name: "DragToWorkplace",
  data() {
    return {
      asideWidth: 200,
      jsPlumb: null,
      isStep: null,
      jsPlumbConfig: {
        Anchor: "RightMiddle", //锚点，即端点链接的位置
        Anchors: [null, null], //多个锚点 [源锚点，目标锚点].
        ConnectionsDetachable: false, //节点是否可以用鼠标拖动使其断开，默认为true。即用鼠标链接上的连线，也可以使用鼠标拖动让其断开。设置成false，可以让其拖动也不会自动断开。
        ConnectionOverlays: [
          [
            "Arrow",
            {
              location: 1,
              visible: true,
              width: 11,
              height: 11,
              id: "Arrow"
            }
          ]
        ],
        Connector: [
          "Flowchart",
          {
            stub: [40, 60],
            gap: 10,
            cornerRadius: 5,
            alwaysRespectStubs: true
          }
        ], //连接的曲线函数
        Container: "workplace", //连线的容器
        DoNotThrowErrors: false, //是否抛出错误
        DragOptions: {}, //拖动设置
        DropOptions: {}, //拖放设置
        Endpoint: "Dot", //端点
        Endpoints: [null, null], //数组形式的，[源端点，目标端点]
        EndpointOverlays: [], //端点遮罩层
        EndpointStyle: { fill: "red" }, //端点样式
        EndpointStyles: [
          { stroke: "#7AB02C", fill: "transparent", radius: 5, strokeWidth: 1 },
          { fill: "skyblue", stroke: "#216477", radius: 5, strokeWidth: 1 }
        ], //[源端点样式，目标端点样式]
        EndpointHoverStyle: {}, // 端点鼠标经过的样式
        EndpointHoverStyles: [null, null], // [源端点鼠标经过样式，目标端点鼠标经过样式]
        LabelStyle: { color: "black" }, //标签样式
        LogEnabled: false, //是否启用日志
        Overlays: [], //连接线和端点的遮罩层样式
        MaxConnections: -1, //端点最大连接线数量默认为1， 设置成-1可以表示无数个链接
        PaintStyle: {
          strokeWidth: 2,
          stroke: "#61B7CF",
          joinstyle: "round",
          outlineStroke: "white",
          outlineWidth: 2
        }, //连线样式
        HoverPaintStyle: {
          strokeWidth: 3,
          stroke: "pink",
          outlineWidth: 5,
          outlineStroke: "white"
        }, //鼠标经过链接线时的样式
        ReattachConnections: false, // 端点是否可以再次重新链接
        RenderMode: "svg", // 渲染模式，默认是svg
        Scope: "jsPlumb_DefaultScope" //作用域，用来区分哪些端点可以链接，作用域相同的可以链接
      },
      sourceEndpointConfig: {
        paintStyle: {
          stroke: "#7AB02C",
          fill: "transparent",
          radius: 5,
          strokeWidth: 1
        },
        hoverPaintStyle: {
          fill: "pink",
          stroke: "blue"
        },
        // maxConnections: -1,
        isSource: true,
        connectorStyle: {
          strokeWidth: 2,
          stroke: "#61B7CF",
          joinstyle: "round",
          outlineStroke: "white",
          outlineWidth: 2
        },
        //连接线条浮动样式
        connectorHoverStyle: {
          strokeWidth: 3,
          stroke: "pink",
          outlineWidth: 5,
          outlineStroke: "white"
        }
      },
      targetEndpointConfig: {
        paintStyle: {
          fill: "skyblue",
          stroke: "#216477",
          radius: 5,
          strokeWidth: 1
        },
        hoverPaintStyle: {
          fill: "#216477",
          stroke: "#216477"
        },
        // maxConnections: -1,
        isTarget: true
      },

      stepList: [
        { name: "开始", key: "start", id: "start" },
        { name: "分支", key: "master", id: "master" },
        { name: "结束", key: "end", id: "end" }
      ],
      draggableNode: null,
      connectionNodes: [
        {
          //节点集合
          icon: "el-icon-loading",
          id: "start",
          nodeStyle: {
            top: 100,
            left: 200
          },
          isSource: true,
          isTarget: false,
          text: "开始",
          type: "circle"
        },
        {
          //节点集合
          icon: "el-icon-loading",
          id: "master",
          nodeStyle: {
            top: 200,
            left: 500
          },
          isSource: true,
          isTarget: true,
          text: "分支",
          type: "circle"
        },
        {
          icon: "el-icon-upload",
          id: "end",
          nodeStyle: {
            top: 300,
            left: 400
          },
          isSource: false,
          isTarget: true,
          text: "结束",
          type: "circle"
        }
      ],
      connectionList: [
        // { sourceId: "start", targetId: "master" },
        // { sourceId: "master", targetId: "end" },
      ],
      connectionListData: [
        {
          id: "start",
          children: [{ id: "master", children: [{ id: "end", children: [] }] }]
        }
      ],
      formLabelAlign: {
        name: "",
        region: "",
        type: ""
      }
    };
  },
  created() {
    if (localStorage.getItem("step")) {
      this.connectionListData = JSON.parse(localStorage.getItem("step"));
    }
    if (localStorage.getItem("stepNode")) {
      this.connectionNodes = JSON.parse(localStorage.getItem("stepNode"));
    }
    this.connectionList = this.stepToLine(this.connectionListData);
    this.jsPlumb = jsplumb.jsPlumb.getInstance(this.jsPlumbConfig);
  },
  mounted() {
    const _this = this;
    let instance = _this.jsPlumb;
    instance.ready(() => {
      instance.getAllConnections();
      instance.batch(function() {
        _this.initAll(_this.connectionNodes);
        _this.connectionAll();
        instance.bind("connection", function(conn, originalEvent) {
          _this.connectionList.push({
            sourceId: conn.sourceId,
            targetId: conn.targetId
          });
        });
        instance.bind("click", function(conn, originalEvent) {
          _this.deleteConnection(conn, originalEvent);
        });
        instance.bind("connectionDrag", function(connection) {});
        instance.bind("connectionDragStop", function(connection) {});
        instance.bind("connectionMoved", function(params) {});
      });
      // 将模块拖入画板中
      $(".box-card .chart-item").draggable({
        scope: "plant",
        helper: "clone",
        containment: $("#work-container")
      });
      $("#workplace").droppable({
        scope: "plant",
        drop: function(ev, ui) {
          let nodeInfo = {
            icon: "el-icon-loading",
            id: ui.helper.attr("data-id"),
            nodeStyle: {
              top: ui.position.top,
              left: ui.position.left - 200
            },
            text: ui.helper.html(),
            type: "circle",
            isSource: true,
            isTarget: true
          };
          _this.addNode(nodeInfo);
        }
      });
    });
  },
  computed: {
    // connectionList: function () {
    //   return this.stepToLine(this.connectionListData);
    // },
  },
  watch: {
    connectionNodes: {
      handler(newValue, oldValue) {},
      deep: true
    }
  },
  updated() {
    var nodeInfo = this.connectionNodes[this.connectionNodes.length - 1];
    var _this = this;
    this.addEndpoints(nodeInfo, ["Right"], ["Left"]);
    this.jsPlumb.draggable(nodeInfo.id);
  },
  methods: {
    saveStep() {
      var step = this.lineToStep(this.connectionList, "start");
      localStorage.setItem("step", JSON.stringify([step]));
      localStorage.setItem("stepNode", JSON.stringify(this.connectionNodes));
      this.$message("保存成功");
      this.connectionNodes = [];
      this.connectionListData = [];
      this.connectionList = [];
      $("#workplace").html("");
    },
    lineToStep(lineArr, id) {
      // var lineArr=this.connectionList;
      var result = { id: id, children: [] };
      for (var i = 0; i < lineArr.length; i++) {
        if (lineArr[i].sourceId == id) {
          result.children.push(this.lineToStep(lineArr, lineArr[i].targetId));
        }
      }
      return result;
    },
    stepToLine(arr, source) {
      var result = [];
      for (var i = 0; i < arr.length; i++) {
        if (source) {
          result.push({ sourceId: source, targetId: arr[i].id });
        } else {
        }
        if (arr[i].children.length) {
          result.push(...this.stepToLine(arr[i].children, arr[i].id));
        }
      }
      return result;
    },
    initAll(connectionNodes) {
      if (!connectionNodes.length) return;
      for (let i = 0, m = connectionNodes.length; i < m; i++) {
        this.addEndpoints(connectionNodes[i], ["Right"], ["Left"]);
        this.jsPlumb.draggable(connectionNodes[i].id);
      }
    },
    connectionAll() {
      const instance = this.jsPlumb;
      if (!this.connectionList.length) return;
      for (let i = 0; i < this.connectionList.length; i++) {
        let conn = this.connectionList[i];
        let connection = instance.connect(this.jsPlumbConfig, {
          source: conn.sourceId,
          target: conn.targetId,
          anchors: ["Right", "Left"]
        });
      }
    },
    checkNode(nodeInfo) {
      var node = document.getElementById(nodeInfo.id);
      var result = null;
      if (node) {
        switch (nodeInfo.id) {
          case "start":
          case "end":
            this.$message("组件已存在，请拖动别的组件");
            result = { flag: false };
            break;
          default:
            result = nodeInfo;
            result.flag = true;
            result.id = nodeInfo.id + new Date().getTime();
        }
      } else {
        result = nodeInfo;
        result.flag = true;
      }
      switch (result.id) {
        case "start":
          result.isTarget = false;
          result.isSource = true;
          break;
        case "end":
          result.isSource = false;
          result.isTarget = true;
          break;
        default:
          result.isSource = true;
          result.isTarget = true;
      }
      return result;
    },
    addNode(nodeInfoParams) {
      let nodeInfo = this.checkNode(nodeInfoParams);
      if (!nodeInfo.flag) return;
      this.connectionNodes.push(nodeInfo);
    },
    addEndpoints(nodeInfo, sourceAnchors, targetAnchors) {
      let instance = this.jsPlumb;
      if (nodeInfo.isSource) {
        var maxConnections = -1;
        if (nodeInfo.id !== "start" && nodeInfo.id !== "end") {
          maxConnections = 1;
        }
        for (var i = 0; i < sourceAnchors.length; i++) {
          var sourceUUID = nodeInfo.id + sourceAnchors[i];
          instance.addEndpoint(nodeInfo.id, this.sourceEndpointConfig, {
            anchor: sourceAnchors[i],
            maxConnections
          });
        }
      }
      if (nodeInfo.isTarget) {
        for (var j = 0; j < targetAnchors.length; j++) {
          var targetUUID = nodeInfo.id + targetAnchors[j];
          instance.addEndpoint(nodeInfo.id, this.targetEndpointConfig, {
            anchor: targetAnchors[j],
            maxConnections
          });
        }
      }
    },
    addLine(sourceId, targetId) {},
    deleteConnection(conn, originalEvent) {
      if (window.confirm("确认是否删除此条连接线？")) {
        this.jsPlumb.deleteConnection(conn);
        this.deleteLine(conn.sourceId, conn.targetId);
      }
    },
    deleteLine(sourceId, targetId) {
      var lineArr = this.connectionList;
      var index = -1;
      for (var i = 0; i < lineArr.length; i++) {
        if (
          lineArr[i].sourceId == sourceId &&
          lineArr[i].targetId == targetId
        ) {
          index = i;
        }
      }
      if (index !== -1) {
        this.connectionList.splice(index, 1);
      }
    }
  }
};
</script>
<style >
html,
body,
#app,
.container {
  height: 100%;
  position: relative;
  user-select: none;
}
aside {
  margin-left: 1px;
  box-sizing: border-box;
  border: 1px solid rgb(200, 200, 200);
}
main {
  border-top: 1px solid rgb(200, 200, 200);
}
.card-header {
  text-align: center;
  height: 30px;
  line-height: 30px;
  border-bottom: 1px solid rgb(200, 200, 200);
}
.card-body {
  display: flex;
  flex-flow: column;
  align-items: center;
}
.workplace {
  width: 100%;
  height: 100%;
  position: relative;
}
.item {
  margin: 20px 0;
  text-align: center;
}
.chart-item {
  display: inline-block;
  width: 100px;
  height: 40px;
  line-height: 40px;
  border: 1px solid black;
  text-align: center;
  margin: 5px;
}
</style>


