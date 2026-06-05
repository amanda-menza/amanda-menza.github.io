import 'package:flutter/foundation.dart';

class SettingsModel with ChangeNotifier {
  bool _notificationResult = true;
  String _searchWeightResult = '2-22lbs';
  String _searchAgeResult = '5';
  String _searchTimeResult = '5';

  bool get notificationResult => _notificationResult;
  String get searchWeightResult => _searchWeightResult;
  String get searchAgeResult => _searchAgeResult;
  String get searchTimeResult => _searchTimeResult;

  void updateNotification(bool value) {
    _notificationResult = value;
    notifyListeners();
  }

  void updateWeight(String value) {
    _searchWeightResult = value;
    notifyListeners();
  }

  void updateAge(String value) {
    _searchAgeResult = value;
    notifyListeners();
  }

  void updateTime(String value) {
    _searchTimeResult = value;
    notifyListeners();
  }
}
