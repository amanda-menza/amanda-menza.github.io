class DetectionData {
  final DateTime timestamp;
  final int detected;
  final int dispersed;

  DetectionData(
      {required this.timestamp,
      required this.detected,
      required this.dispersed});

  factory DetectionData.fromJson(Map<String, dynamic> json) {
    return DetectionData(
      timestamp: DateTime.parse(json['timestamp']),
      detected: json['detected'] as int,
      dispersed: json['dispersed'] as int,
    );
  }
  static List<DetectionData> listFromJson(List<dynamic> jsonList) {
    return jsonList.map((json) => DetectionData.fromJson(json)).toList();
  }
}
