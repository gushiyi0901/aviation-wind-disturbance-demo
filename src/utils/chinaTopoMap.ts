import chinaTopoJson from '../data/china.topo.json';

type Position = [number, number];

type TopologyTransform = {
  scale: Position;
  translate: Position;
};

type TopologyGeometry = {
  type: 'Polygon' | 'MultiPolygon' | 'MultiLineString';
  arcs: number[][] | number[][][];
  properties?: {
    code?: string;
    level?: number;
    name?: string;
  };
};

type ChinaTopology = {
  type: 'Topology';
  bbox: [number, number, number, number];
  transform: TopologyTransform;
  arcs: Position[][];
  objects: {
    default: {
      type: 'GeometryCollection';
      geometries: TopologyGeometry[];
    };
  };
};

type MapFeature = {
  key: string;
  path: string;
};

type ProjectedPoint = {
  x: number;
  y: number;
};

type MapBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type ProjectionBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: number;
};

const topology = chinaTopoJson as unknown as ChinaTopology;
const decodedArcs = topology.arcs.map((arc) => decodeArc(arc, topology.transform));
const MAP_VIEWBOX_WIDTH = 1000;
const MAP_VIEWBOX_HEIGHT = 760;

export const CHINA_TOPO_SOURCE_URL = 'https://geojson.cn/api/china/1.6.3/china.topo.json';
export const CHINA_TOPO_DOCS_URL = 'https://geojson.cn/api/china/100000.topo.json';

const polygonGeometries = topology.objects.default.geometries.filter(
  (geometry): geometry is TopologyGeometry => geometry.type === 'Polygon' || geometry.type === 'MultiPolygon',
);

const lineGeometries = topology.objects.default.geometries.filter(
  (geometry): geometry is TopologyGeometry => geometry.type === 'MultiLineString',
);

const mainlandGeometries = polygonGeometries.filter((geometry) => geometry.properties?.level === 1);
const insetGeometries = polygonGeometries.filter((geometry) => geometry.properties?.level !== 1);

const mainlandBounds = measureGeometryBounds(mainlandGeometries);
const insetBounds = measureGeometryBounds(insetGeometries);
const mainlandProjection = createProjection(mainlandBounds, {
  x: 58,
  y: 28,
  width: 872,
  height: 650,
  padding: 18,
});
const insetProjection = createProjection(insetBounds, {
  x: 764,
  y: 528,
  width: 184,
  height: 164,
  padding: 14,
});

export const chinaMapViewBox = {
  width: MAP_VIEWBOX_WIDTH,
  height: MAP_VIEWBOX_HEIGHT,
};

const southChinaSeaGeometry = polygonGeometries.find((geometry) => geometry.properties?.name === '南海诸岛') ?? null;
const southChinaSeaFrameIndex = southChinaSeaGeometry ? findInsetFramePolygonIndex(southChinaSeaGeometry) : -1;

export const southChinaSeaInsetFrame =
  southChinaSeaGeometry && southChinaSeaFrameIndex >= 0
    ? measureProjectedPolygonBounds((southChinaSeaGeometry.arcs as number[][][])[southChinaSeaFrameIndex][0], insetProjection)
    : null;

export const provincePaths = polygonGeometries
  .filter((geometry) => geometry.properties?.level === 1)
  .map((geometry, index) => ({
    key: geometry.properties?.code ?? `province-${index}`,
    path:
      geometry.type === 'Polygon'
        ? buildPolygonPath(geometry.arcs as number[][], mainlandProjection)
        : buildMultiPolygonPath(geometry.arcs as number[][][], mainlandProjection),
  }));

export const insetIslandPaths = polygonGeometries
  .filter((geometry) => geometry.properties?.level !== 1)
  .flatMap((geometry, index) => {
    if (geometry.type === 'Polygon') {
      return [
        {
          key: geometry.properties?.code ?? `inset-${index}`,
          path: buildPolygonPath(geometry.arcs as number[][], insetProjection),
        },
      ];
    }

    const polygons = geometry.arcs as number[][][];
    return polygons
      .filter((_, polygonIndex) => !(geometry.properties?.name === '南海诸岛' && polygonIndex === southChinaSeaFrameIndex))
      .map((polygon, polygonIndex) => ({
        key: `${geometry.properties?.code ?? `inset-${index}`}-${polygonIndex}`,
        path: buildPolygonPath(polygon, insetProjection),
      }));
  });

export const dashLinePaths = lineGeometries.map((geometry, index) => ({
  key: geometry.properties?.code ?? `dash-${index}`,
  path: buildMultiLinePath(geometry.arcs as number[][], insetProjection),
}));

export function projectAirportToChinaMap(longitude: number, latitude: number): ProjectedPoint {
  const [gcjLongitude, gcjLatitude] = wgs84ToGcj02(longitude, latitude);
  return mainlandProjection([gcjLongitude, gcjLatitude]);
}

function decodeArc(arc: Position[], transform: TopologyTransform): Position[] {
  let absoluteX = 0;
  let absoluteY = 0;

  return arc.map(([deltaX, deltaY]) => {
    absoluteX += deltaX;
    absoluteY += deltaY;

    return [
      absoluteX * transform.scale[0] + transform.translate[0],
      absoluteY * transform.scale[1] + transform.translate[1],
    ];
  });
}

function measureGeometryBounds(geometries: TopologyGeometry[]) {
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  geometries.forEach((geometry) => {
    const arcGroups = flattenArcReferences(geometry.arcs);

    arcGroups.forEach((arcReferences) => {
      stitchArcReferences(arcReferences, ([longitude, latitude]) => ({ x: longitude, y: latitude })).forEach(({ x, y }) => {
        const planarPoint = projectChinaConic([x, y]);
        minX = Math.min(minX, planarPoint.x);
        maxX = Math.max(maxX, planarPoint.x);
        minY = Math.min(minY, planarPoint.y);
        maxY = Math.max(maxY, planarPoint.y);
      });
    });
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
  };
}

function flattenArcReferences(arcs: number[][] | number[][][]) {
  const flattened: number[][] = [];

  if (typeof arcs[0]?.[0] === 'number') {
    return arcs as number[][];
  }

  (arcs as number[][][]).forEach((polygon) => {
    polygon.forEach((ring) => {
      flattened.push(ring);
    });
  });

  return flattened;
}

function buildPolygonPath(rings: number[][], projection: (position: Position) => ProjectedPoint) {
  return rings.map((ring) => buildLinePath(ring, true, projection)).join(' ');
}

function buildMultiPolygonPath(polygons: number[][][], projection: (position: Position) => ProjectedPoint) {
  return polygons.map((polygon) => buildPolygonPath(polygon, projection)).join(' ');
}

function buildMultiLinePath(lines: number[][], projection: (position: Position) => ProjectedPoint) {
  return lines.map((line) => buildLinePath(line, false, projection)).join(' ');
}

function buildLinePath(arcReferences: number[], closePath: boolean, projection: (position: Position) => ProjectedPoint) {
  const points = stitchArcReferences(arcReferences, projection);
  if (points.length === 0) {
    return '';
  }

  const [firstPoint, ...restPoints] = points;
  const commands = [`M ${firstPoint.x.toFixed(2)} ${firstPoint.y.toFixed(2)}`];

  restPoints.forEach((point) => {
    commands.push(`L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  });

  if (closePath) {
    commands.push('Z');
  }

  return commands.join(' ');
}

function stitchArcReferences<T>(arcReferences: number[], mapPoint: (position: Position) => T) {
  const mergedPoints: T[] = [];

  arcReferences.forEach((arcReference, arcIndex) => {
    const arc = arcReference >= 0 ? decodedArcs[arcReference] : [...decodedArcs[~arcReference]].reverse();
    const projectedArc = arc.map(mapPoint);

    if (arcIndex === 0) {
      mergedPoints.push(...projectedArc);
      return;
    }

    mergedPoints.push(...projectedArc.slice(1));
  });

  return mergedPoints;
}

function findInsetFramePolygonIndex(geometry: TopologyGeometry) {
  if (geometry.type !== 'MultiPolygon') {
    return -1;
  }

  let maxArea = Number.NEGATIVE_INFINITY;
  let frameIndex = -1;

  (geometry.arcs as number[][][]).forEach((polygon, polygonIndex) => {
    const bounds = measureReferenceBounds(polygon[0]);
    const area = bounds.width * bounds.height;
    if (area > maxArea) {
      maxArea = area;
      frameIndex = polygonIndex;
    }
  });

  return frameIndex;
}

function measureReferenceBounds(arcReferences: number[]) {
  const points = stitchArcReferences(arcReferences, ([longitude, latitude]) => ({ x: longitude, y: latitude }));
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  points.forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function measureProjectedPolygonBounds(arcReferences: number[], projection: (position: Position) => ProjectedPoint) {
  const points = stitchArcReferences(arcReferences, projection);
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  points.forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function createProjection(bounds: MapBounds, box: ProjectionBox) {
  const innerWidth = box.width - box.padding * 2;
  const innerHeight = box.height - box.padding * 2;
  const planarWidth = Math.max(bounds.maxX - bounds.minX, 0.001);
  const planarHeight = Math.max(bounds.maxY - bounds.minY, 0.001);
  const scale = Math.min(innerWidth / planarWidth, innerHeight / planarHeight);
  const projectedWidth = planarWidth * scale;
  const projectedHeight = planarHeight * scale;
  const offsetX = box.x + box.padding + (innerWidth - projectedWidth) / 2;
  const offsetY = box.y + box.padding + (innerHeight - projectedHeight) / 2;

  return ([longitude, latitude]: Position): ProjectedPoint => {
    const planarPoint = projectChinaConic([longitude, latitude]);
    return {
      x: offsetX + (planarPoint.x - bounds.minX) * scale,
      y: offsetY + (bounds.maxY - planarPoint.y) * scale,
    };
  };
}

function projectChinaConic([longitude, latitude]: Position): ProjectedPoint {
  const radians = Math.PI / 180;
  const lambda = longitude * radians;
  const phi = latitude * radians;
  const lambda0 = 105 * radians;
  const phi0 = 35 * radians;
  const phi1 = 25 * radians;
  const phi2 = 47 * radians;

  const n =
    Math.log(Math.cos(phi1) / Math.cos(phi2)) /
    Math.log(Math.tan(Math.PI / 4 + phi2 / 2) / Math.tan(Math.PI / 4 + phi1 / 2));
  const f = (Math.cos(phi1) * Math.pow(Math.tan(Math.PI / 4 + phi1 / 2), n)) / n;
  const rho = f / Math.pow(Math.tan(Math.PI / 4 + phi / 2), n);
  const rho0 = f / Math.pow(Math.tan(Math.PI / 4 + phi0 / 2), n);
  const theta = n * (lambda - lambda0);

  return {
    x: rho * Math.sin(theta),
    y: rho0 - rho * Math.cos(theta),
  };
}

function wgs84ToGcj02(longitude: number, latitude: number): Position {
  if (isOutOfChina(longitude, latitude)) {
    return [longitude, latitude];
  }

  const a = 6378245;
  const ee = 0.00669342162296594323;
  let deltaLatitude = transformLatitude(longitude - 105, latitude - 35);
  let deltaLongitude = transformLongitude(longitude - 105, latitude - 35);
  const radians = (latitude / 180) * Math.PI;
  let magic = Math.sin(radians);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);

  deltaLatitude = (deltaLatitude * 180) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  deltaLongitude = (deltaLongitude * 180) / ((a / sqrtMagic) * Math.cos(radians) * Math.PI);

  return [longitude + deltaLongitude, latitude + deltaLatitude];
}

function isOutOfChina(longitude: number, latitude: number) {
  return longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271;
}

function transformLatitude(x: number, y: number) {
  let result = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  result += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3;
  result += ((20 * Math.sin(y * Math.PI) + 40 * Math.sin((y / 3) * Math.PI)) * 2) / 3;
  result += ((160 * Math.sin((y / 12) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30)) * 2) / 3;
  return result;
}

function transformLongitude(x: number, y: number) {
  let result = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  result += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3;
  result += ((20 * Math.sin(x * Math.PI) + 40 * Math.sin((x / 3) * Math.PI)) * 2) / 3;
  result += ((150 * Math.sin((x / 12) * Math.PI) + 300 * Math.sin((x / 30) * Math.PI)) * 2) / 3;
  return result;
}
