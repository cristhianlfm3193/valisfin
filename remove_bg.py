import sys
from PIL import Image

def remove_black_background(input_path, output_path, threshold=20):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if the pixel is dark enough to be considered "black"
        # item is (R, G, B, A)
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            # Change all dark pixels to transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python remove_bg.py <input> <output> <threshold>")
        sys.exit(1)
    
    in_path = sys.argv[1]
    out_path = sys.argv[2]
    threshold = int(sys.argv[3])
    
    remove_black_background(in_path, out_path, threshold)
    print(f"Processed {in_path} to {out_path} with threshold {threshold}")
