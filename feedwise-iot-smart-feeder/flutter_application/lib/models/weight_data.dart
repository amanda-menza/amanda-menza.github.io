import 'package:intl/intl.dart'; // Import the intl package

class WeightData {
  final DateTime timestamp;
  final double weight;

  WeightData({required this.timestamp, required this.weight});

  static List<WeightData> listFromJson(List<dynamic> jsonList) {
    final dateFormatter = DateFormat(
        "EEE, dd MMM yyyy HH:mm:ss 'GMT'"); // Define the expected format

    return jsonList.map((json) {
      return WeightData(
        timestamp: dateFormatter.parse(
            json['timestamp']), // Use the dateFormatter to parse the timestamp
        weight: json['weight'].toDouble(),
      );
    }).toList();
  }
}
