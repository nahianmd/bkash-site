// Rasterise one page of a PDF at a given scale.
// macOS ships no pdftoppm/gs/Inkscape, but CoreGraphics reads PDF natively.
//   swiftc -O tools/pdfraster.swift -o build/tmp/pdfraster
//   ./build/tmp/pdfraster in.pdf out.png 20
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count >= 4,
      let scale = Double(args[3]) else {
    FileHandle.standardError.write("usage: pdfraster <in.pdf> <out.png> <scale>\n".data(using: .utf8)!)
    exit(2)
}
let inURL = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])

guard let doc = CGPDFDocument(inURL as CFURL), let page = doc.page(at: 1) else {
    FileHandle.standardError.write("cannot open PDF\n".data(using: .utf8)!); exit(1)
}
let box = page.getBoxRect(.mediaBox)
let w = Int((box.width * scale).rounded())
let h = Int((box.height * scale).rounded())
print("page \(Int(box.width))x\(Int(box.height))pt -> \(w)x\(h)px at \(scale)x")

guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8,
                          bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(),
                          bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else {
    FileHandle.standardError.write("cannot create context\n".data(using: .utf8)!); exit(1)
}
ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
ctx.scaleBy(x: CGFloat(scale), y: CGFloat(scale))
ctx.translateBy(x: -box.origin.x, y: -box.origin.y)
ctx.interpolationQuality = .high
ctx.drawPDFPage(page)

guard let img = ctx.makeImage(),
      let dest = CGImageDestinationCreateWithURL(outURL as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    FileHandle.standardError.write("cannot write image\n".data(using: .utf8)!); exit(1)
}
CGImageDestinationAddImage(dest, img, nil)
CGImageDestinationFinalize(dest)
print("wrote \(outURL.path)")
