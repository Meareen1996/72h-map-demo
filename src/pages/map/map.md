LoadScript: 加载 Google Maps API，并通过 libraries prop 传入所需的功能库。在这个例子中，我们加载了 drawing 库。

jsx
复制代码
<LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" libraries={['drawing']}>
GoogleMap: 渲染 Google 地图组件。

DrawingManager: Google Maps API 提供的绘图工具，允许用户在地图上绘制几何形状。我们可以通过 drawingControlOptions 来配置用户可以绘制的形状类型（多边形、矩形、圆形等）。

onOverlayComplete: 当用户绘制完成时的回调函数。你可以从 e 事件中获取绘制的图形对象（overlay）和图形的具体信息（如路径或边界）。

重要的配置选项
drawingControl: 是否显示绘图工具栏。
drawingModes: 启用哪些绘图工具（如多边形、矩形、圆形等）。
polygonOptions: 配置绘制多边形的样式，例如颜色、透明度、可编辑性等