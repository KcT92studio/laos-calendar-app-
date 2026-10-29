import zlib
import struct
import math
import os

def create_png(width, height, file_path):
    # Prepare raw RGBA image buffer
    # Background: Lao Buddhist Golden Amber (#b45309 -> R:180, G:83, B:9)
    # Center circle: Warm Ivory White (#fef3c7 -> R:254, G:243, B:199)
    # Center emblem: Lotus/Calendar symbol
    
    rows = []
    center_x = width / 2.0
    center_y = height / 2.0
    radius = width * 0.40
    inner_radius = width * 0.35
    
    for y in range(height):
        row = bytearray([0]) # Filter type 0 (None)
        for x in range(width):
            dx = x - center_x
            dy = y - center_y
            dist = math.sqrt(dx * dx + dy * dy)
            
            # Rounded corner squircle / circle background
            # Safe zone padding (Android maskable friendly)
            if dist <= inner_radius:
                # Inside inner badge
                # Draw a calendar header (top part)
                cal_top = center_y - width * 0.22
                cal_bottom = center_y + width * 0.22
                cal_left = center_x - width * 0.25
                cal_right = center_x + width * 0.25
                
                if cal_left <= x <= cal_right and cal_top <= y <= cal_bottom:
                    # Calendar frame
                    if y <= cal_top + (cal_bottom - cal_top) * 0.30:
                        # Top header of calendar: Gold/Amber (#d97706)
                        r, g, b, a = 217, 119, 6, 255
                    elif abs(x - cal_left) <= 2 or abs(x - cal_right) <= 2 or abs(y - cal_bottom) <= 2:
                        # Border of calendar
                        r, g, b, a = 217, 119, 6, 255
                    else:
                        # Calendar body (White)
                        # Draw date grid dots
                        grid_x = (x - cal_left) / (cal_right - cal_left)
                        grid_y = (y - (cal_top + (cal_bottom - cal_top) * 0.30)) / ((cal_bottom - cal_top) * 0.70)
                        
                        # In the middle, draw a golden full moon / wan sin circle
                        mdx = x - center_x
                        mdy = y - (center_y + width * 0.04)
                        mdist = math.sqrt(mdx * mdx + mdy * mdy)
                        if mdist <= width * 0.08:
                            # Golden moon
                            r, g, b, a = 245, 158, 11, 255
                        elif (0.2 < grid_x < 0.8) and (0.8 < grid_y < 0.95):
                            # Text bar
                            r, g, b, a = 180, 83, 9, 255
                        else:
                            r, g, b, a = 255, 255, 255, 255
                else:
                    # Inner circle background: Light Gold/Amber Ivory (#fffbeb)
                    r, g, b, a = 255, 251, 235, 255
            elif dist <= radius:
                # Outer ring: Gold (#f59e0b)
                r, g, b, a = 245, 158, 11, 255
            else:
                # Full bleed background for maskable compliance (#b45309)
                r, g, b, a = 180, 83, 9, 255
            
            row.extend([r, g, b, a])
        rows.append(bytes(row))
        
    raw_data = b"".join(rows)
    compressed_data = zlib.compress(raw_data, 9)
    
    def make_chunk(chunk_type, data):
        length = struct.pack(">I", len(data))
        crc = struct.pack(">I", zlib.crc32(chunk_type + data) & 0xffffffff)
        return length + chunk_type + data + crc

    png_header = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr_chunk = make_chunk(b"IHDR", ihdr)
    idat_chunk = make_chunk(b"IDAT", compressed_data)
    iend_chunk = make_chunk(b"IEND", b"")
    
    with open(file_path, "wb") as f:
        f.write(png_header + ihdr_chunk + idat_chunk + iend_chunk)
    print(f"Generated {file_path} ({width}x{height})")

if __name__ == "__main__":
    os.makedirs("/app/applet/public", exist_ok=True)
    create_png(192, 192, "/app/applet/public/icon-192.png")
    create_png(512, 512, "/app/applet/public/icon-512.png")
    # Also write to root for static deploy
    create_png(192, 192, "/app/applet/icon-192.png")
    create_png(512, 512, "/app/applet/icon-512.png")
