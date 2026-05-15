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
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
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
const MAP_VIEWBOX_HEIGHT = 700;

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
  x: 22,
  y: 24,
  width: 936,
  height: 586,
  padding: 18,
});
const insetProjection = createProjection(insetBounds, {
  x: 764,
  y: 472,
  width: 184,
  height: 164,
  padding: 14,
});

export const chinaMapViewBox = {
  width: MAP_VIEWBOX_WIDTH,
  height: MAP_VIEWBOX_HEIGHT,
};

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
  .map((geometry, index) => ({
    key: geometry.properties?.code ?? `inset-${index}`,
    path:
      geometry.type === 'Polygon'
        ? buildPolygonPath(geometry.arcs as number[][], insetProjection)
        : buildMultiPolygonPath(geometry.arcs as number[][][], insetProjection),
  }));

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
  let minLongitude = Number.POSITIVE_INFINITY;
  let maxLongitude = Number.NEGATIVE_INFINITY;
  let minLatitude = Number.POSITIVE_INFINITY;
  let maxLatitude = Number.NEGATIVE_INFINITY;

  geometries.forEach((geometry) => {
    const arcGroups = flattenArcReferences(geometry.arcs);

    arcGroups.forEach((arcReferences) => {
      stitchArcReferences(arcReferences, ([longitude, latitude]) => ({ x: longitude, y: latitude })).forEach(({ x, y }) => {
        minLongitude = Math.min(minLongitude, x);
        maxLongitude = Math.max(maxLongitude, x);
        minLatitude = Math.min(minLatitude, y);
        maxLatitude = Math.max(maxLatitude, y);
      });
    });
  });

  return {
    minLongitude,
    maxLongitude,
    minLatitude,
    maxLatitude,
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

function createProjection(bounds: MapBounds, box: ProjectionBox) {
  const innerWidth = box.width - box.padding * 2;
  const innerHeight = box.height - box.padding * 2;
  const longitudeSpan = Math.max(bounds.maxLongitude - bounds.minLongitude, 0.001);
  const latitudeSpan = Math.max(bounds.maxLatitude - bounds.minLatitude, 0.001);
  const scale = Math.min(innerWidth / longitudeSpan, innerHeight / latitudeSpan);
  const projectedWidth = longitudeSpan * scale;
  const projectedHeight = latitudeSpan * scale;
  const offsetX = box.x + box.padding + (innerWidth - projectedWidth) / 2;
  const offsetY = box.y + box.padding + (innerHeight - projectedHeight) / 2;

  return ([longitude, latitude]: Position): ProjectedPoint => ({
    x: offsetX + (longitude - bounds.minLongitude) * scale,
    y: offsetY + (bounds.maxLatitude - latitude) * scale,
  });
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
