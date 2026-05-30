import Foundation

enum Validators {
    static func username(_ value: String) -> Bool {
        let regex = try? NSRegularExpression(pattern: "^[A-Za-z0-9_.]{3,30}$")
        let range = NSRange(location: 0, length: value.utf16.count)
        return regex?.firstMatch(in: value, options: [], range: range) != nil
    }

    static func nonEmpty(_ value: String, min: Int = 1) -> Bool {
        value.trimmingCharacters(in: .whitespacesAndNewlines).count >= min
    }
}
