idf_component_register(SRCS "main.c"
                       INCLUDE_DIRS "."
                       PRIV_INCLUDE_DIRS "${CMAKE_CURRENT_SOURCE_DIR}/../managed_components/lvgl__lvgl/src/core"
                       PRIV_REQUIRES lvgl driver esp_wifi nvs_flash esp_event esp_http_client json esp-tls rc522 hx711 esp_http_server servo_motor servo_motor360)
