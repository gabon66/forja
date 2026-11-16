#!/usr/bin/env python3
"""Build the approximate, dimensioned GLB used by the Mesa Living Nord viewer."""

import json
import math
import struct
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "img" / "modelos"
WOOD_FINISHES = (
    ("miel", "#c79a63"),
    ("roble", "#9b6b3e"),
    ("nogal", "#6f4a2b"),
    ("ebano", "#3e2a1c"),
)
IRON_FINISHES = (("negro", "#262626"), ("blanco", "#e8e7e3"))


def cube_geometry():
    faces = [
        ((1, 0, 0), ((.5, .5, .5), (.5, -.5, .5), (.5, -.5, -.5), (.5, .5, -.5))),
        ((-1, 0, 0), ((-.5, .5, -.5), (-.5, -.5, -.5), (-.5, -.5, .5), (-.5, .5, .5))),
        ((0, 1, 0), ((-.5, .5, .5), (.5, .5, .5), (.5, .5, -.5), (-.5, .5, -.5))),
        ((0, -1, 0), ((-.5, -.5, -.5), (.5, -.5, -.5), (.5, -.5, .5), (-.5, -.5, .5))),
        ((0, 0, 1), ((-.5, .5, .5), (-.5, -.5, .5), (.5, -.5, .5), (.5, .5, .5))),
        ((0, 0, -1), ((.5, .5, -.5), (.5, -.5, -.5), (-.5, -.5, -.5), (-.5, .5, -.5))),
    ]
    positions, normals, texcoords, indices = [], [], [], []
    for face_index, (normal, corners) in enumerate(faces):
        start = len(positions) // 3
        for vertex_index, point in enumerate(corners):
            positions.extend(point)
            normals.extend(normal)
            texcoords.extend(((0, 0), (0, 1), (1, 1), (1, 0))[vertex_index])
        indices.extend((start, start + 1, start + 2, start, start + 2, start + 3))
    return positions, normals, texcoords, indices


def srgb_channel_to_linear(value):
    value /= 255
    return value / 12.92 if value <= .04045 else ((value + .055) / 1.055) ** 2.4


def rgba(hex_color):
    return [srgb_channel_to_linear(int(hex_color[i:i + 2], 16)) for i in (1, 3, 5)] + [1]


def make_wood_texture(hex_color):
    width = height = 256
    base = [int(hex_color[index:index + 2], 16) for index in (1, 3, 5)]
    scanlines = bytearray()
    for y in range(height):
        scanlines.append(0)
        for x in range(width):
            grain = (
                .035 * math.sin(x * .075 + 1.1 * math.sin(y * .032))
                + .022 * math.sin(x * .24 + .8 * math.sin(y * .09))
                + .008 * math.sin(x * .78 + .5 * math.sin(y * .2))
                + .008 * math.sin(y * .12 + x * .009)
            )
            knot_one = math.exp(-(((x - 68) / 16) ** 2 + ((y - 150) / 7) ** 2) * 1.8)
            knot_two = math.exp(-(((x - 204) / 20) ** 2 + ((y - 58) / 8) ** 2) * 1.8)
            grain += .018 * knot_one * math.sin(x * .7) + .018 * knot_two * math.sin(x * .6)
            factor = 1 + grain
            scanlines.extend(max(0, min(255, round(channel * factor))) for channel in base)
            scanlines.append(255)

    def chunk(tag, payload):
        return struct.pack(">I", len(payload)) + tag + payload + struct.pack(">I", zlib.crc32(tag + payload) & 0xffffffff)

    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(scanlines, 9)) + chunk(b"IEND", b"")


def align4(data):
    return data + b"\0" * ((-len(data)) % 4)


def quaternion_from_z(direction):
    length = math.sqrt(sum(value * value for value in direction))
    vector = tuple(value / length for value in direction)
    dot = max(-1.0, min(1.0, vector[2]))
    if dot < -0.999999:
        return [1, 0, 0, 0]
    axis = (-vector[1], vector[0], 0)
    axis_length = math.sqrt(sum(value * value for value in axis))
    if axis_length < 1e-8:
        return [0, 0, 0, 1]
    half_angle = math.acos(dot) / 2
    scale = math.sin(half_angle) / axis_length
    return [axis[0] * scale, axis[1] * scale, axis[2] * scale, math.cos(half_angle)]


def make_glb(wood_color, iron_color, model_type="shelf"):
    positions, normals, texcoords, indices = cube_geometry()
    binary = bytearray()
    views = []
    accessors = []

    def add_view(data, target):
        offset = len(binary)
        binary.extend(data)
        binary.extend(b"\0" * ((-len(binary)) % 4))
        view = {"buffer": 0, "byteOffset": offset, "byteLength": len(data)}
        if target:
            view["target"] = target
        views.append(view)
        return len(views) - 1

    position_data = struct.pack(f"<{len(positions)}f", *positions)
    normal_data = struct.pack(f"<{len(normals)}f", *normals)
    uv_data = struct.pack(f"<{len(texcoords)}f", *texcoords)
    index_data = struct.pack(f"<{len(indices)}H", *indices)
    position_view = add_view(position_data, 34962)
    normal_view = add_view(normal_data, 34962)
    uv_view = add_view(uv_data, 34962)
    index_view = add_view(index_data, 34963)
    wood_image_view = add_view(make_wood_texture(wood_color), None)

    accessors.extend((
        {"bufferView": position_view, "componentType": 5126, "count": len(positions) // 3,
         "type": "VEC3", "min": [-.5, -.5, -.5], "max": [.5, .5, .5]},
        {"bufferView": normal_view, "componentType": 5126, "count": len(normals) // 3, "type": "VEC3"},
        {"bufferView": uv_view, "componentType": 5126, "count": len(texcoords) // 2, "type": "VEC2"},
        {"bufferView": index_view, "componentType": 5123, "count": len(indices), "type": "SCALAR"},
    ))

    nodes = []

    def box(name, material_index, center, size, rotation=None):
        node = {"name": name, "mesh": material_index, "translation": list(center), "scale": list(size)}
        if rotation:
            node["rotation"] = rotation
        nodes.append(node)

    def beam(name, start, end, width, material_index=1):
        direction = tuple(end[i] - start[i] for i in range(3))
        length = math.sqrt(sum(value * value for value in direction))
        center = tuple((start[i] + end[i]) / 2 for i in range(3))
        box(name, material_index, center, (width, width, length), quaternion_from_z(direction))

    if model_type == "simple":
        # Straight rectangular frame; all dimensions are meters. The tabletop
        # is 120 x 50 cm and its underside is 47 cm above the floor.
        box("Tapa de madera maciza 120 x 50 cm", 0, (0, .485, 0), (1.2, .03, .5))
        for side_x in (-.56, .56):
            for side_z in (-.21, .21):
                box("Pata recta de hierro 80 x 80 mm", 1, (side_x, .235, side_z), (.08, .47, .08))
            box("Travesaño superior recto", 1, (side_x, .43, 0), (.08, .08, .34))
            box("Travesaño inferior recto", 1, (side_x, .04, 0), (.08, .08, .34))
        for side_z in (-.21, .21):
            box("Larguero longitudinal superior recto", 1, (0, .43, side_z), (1.04, .08, .08))
    else:
        # Y is vertical in glTF. Dimensions are meters; the top is exactly 1.20 x 0.60 x 0.03 m.
        box("Tapa de madera maciza 120 x 60 x 3 cm", 0, (0, .585, 0), (1.2, .03, .6))

        # The two end frames are trapezoids: 60 cm outside width at the top,
        # narrowing to 44 cm at the floor (80 mm inward on each side).
        for side_x in (-.56, .56):
            box("Travesaño superior del trapecio, ancho exterior 60 cm", 1, (side_x, .53, 0), (.08, .08, .52))
            box("Travesaño inferior del trapecio, ancho exterior 44 cm", 1, (side_x, .04, 0), (.08, .08, .36))
            for side_z in (-1, 1):
                beam(
                    "Pata inclinada hacia adentro, perfil 80 x 80 mm",
                    # Extend each leg through the lower and upper crossbars so
                    # angled end caps cannot leave visible gaps at the joints.
                    (side_x, 0, side_z * .174),
                    (side_x, .57, side_z * .266),
                    .08,
                )

        # Longitudinal rails meet the inside faces of the end frames. Their outside
        # faces still define the full 120 cm overall length with the 80 mm frames.
        for side_z in (-.26, .26):
            box("Larguero longitudinal superior de hierro 80 x 80 mm", 1, (0, .53, side_z), (1.04, .08, .08))

        # The approximate lower shelf rests on the bottom crossbars of the end
        # frames and matches the tabletop's full 120 cm length.
        box("Estante inferior de madera de 120 cm (proporción aproximada)", 0, (0, .0925, 0), (1.2, .025, .3))

    materials = [
        {"name": "Madera", "pbrMetallicRoughness": {
            "baseColorFactor": [1, 1, 1, 1], "baseColorTexture": {"index": 0},
            "metallicFactor": 0, "roughnessFactor": .58}},
        {"name": "Hierro", "pbrMetallicRoughness": {
            "baseColorFactor": rgba(iron_color), "metallicFactor": .35, "roughnessFactor": .48}},
    ]
    primitives = []
    for material_index in range(2):
        primitives.append({
            "attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2},
            "indices": 3,
            "material": material_index,
            "mode": 4,
        })

    document = {
        "asset": {"version": "2.0", "generator": "Forja Nordica model generator",
                  "extras": ({"tapa_cm": [120, 50], "altura_cm": 50, "perfil_cm": [8, 8],
                              "estructura": "patas rectas sin inclinación"} if model_type == "simple" else
                             {"tapa_cm": [120, 60, 3], "altura_cm": 60, "perfil_cm": [8, 8],
                              "marco_trapezoidal_cm": {"ancho_superior": 60, "ancho_inferior": 44},
                              "estante_inferior": "Proporción aproximada a partir de la foto"})},
        "scene": 0,
        "scenes": [{"nodes": list(range(len(nodes)))}],
        "nodes": nodes,
        "meshes": [
            {"name": "Madera", "primitives": [primitives[0]]},
            {"name": "Hierro", "primitives": [primitives[1]]},
        ],
        "materials": materials,
        "samplers": [{"magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 10497}],
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"name": "Textura de madera", "bufferView": wood_image_view, "mimeType": "image/png"}],
        "accessors": accessors,
        "bufferViews": views,
        "buffers": [{"byteLength": len(binary)}],
    }
    json_chunk = json.dumps(document, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    json_chunk += b" " * ((-len(json_chunk)) % 4)
    binary_chunk = align4(bytes(binary))
    total_length = 12 + 8 + len(json_chunk) + 8 + len(binary_chunk)
    return struct.pack("<4sII", b"glTF", 2, total_length) + \
        struct.pack("<I4s", len(json_chunk), b"JSON") + json_chunk + \
        struct.pack("<I4s", len(binary_chunk), b"BIN\0") + binary_chunk


if __name__ == "__main__":
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    default_model = OUTPUT_DIR / "mesa-living-nord-estante.glb"
    default_model.write_bytes(make_glb(WOOD_FINISHES[0][1], IRON_FINISHES[0][1]))
    print(f"Modelo generado: {default_model.relative_to(ROOT)} ({default_model.stat().st_size:,} bytes)")
    for wood_name, wood_color in WOOD_FINISHES:
        for iron_name, iron_color in IRON_FINISHES:
            output = OUTPUT_DIR / f"mesa-living-nord-estante-{wood_name}-{iron_name}.glb"
            output.write_bytes(make_glb(wood_color, iron_color))
            print(f"Modelo generado: {output.relative_to(ROOT)} ({output.stat().st_size:,} bytes)")
    simple_model = OUTPUT_DIR / "mesa-living-nord.glb"
    simple_model.write_bytes(make_glb(WOOD_FINISHES[0][1], IRON_FINISHES[0][1], "simple"))
    print(f"Modelo generado: {simple_model.relative_to(ROOT)} ({simple_model.stat().st_size:,} bytes)")
    for wood_name, wood_color in WOOD_FINISHES:
        for iron_name, iron_color in IRON_FINISHES:
            output = OUTPUT_DIR / f"mesa-living-nord-{wood_name}-{iron_name}.glb"
            output.write_bytes(make_glb(wood_color, iron_color, "simple"))
            print(f"Modelo generado: {output.relative_to(ROOT)} ({output.stat().st_size:,} bytes)")

