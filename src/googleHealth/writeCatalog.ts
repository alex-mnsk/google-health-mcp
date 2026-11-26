// Generated from the public Google Health v4 Discovery document and data-type table, 2026-10-26.
// https://health.googleapis.com/$discovery/rest?version=v4
// https://developers.google.com/health/data-types
// Field descriptions: Google Developers, CC BY 4.0; schemas describe the API protocol.
export const writeMetrics = [
  {
    "name": "body-fat",
    "field": "bodyFat",
    "schema": "BodyFat",
    "scope": "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.writeonly"
  },
  {
    "name": "exercise",
    "field": "exercise",
    "schema": "Exercise",
    "scope": "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.writeonly"
  },
  {
    "name": "height",
    "field": "height",
    "schema": "Height",
    "scope": "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.writeonly"
  },
  {
    "name": "hydration-log",
    "field": "hydrationLog",
    "schema": "HydrationLog",
    "scope": "https://www.googleapis.com/auth/googlehealth.nutrition.writeonly"
  },
  {
    "name": "menstrual-period",
    "field": "menstrualPeriod",
    "schema": "MenstrualPeriod",
    "scope": "https://www.googleapis.com/auth/googlehealth.reproductive_health.writeonly"
  },
  {
    "name": "moods",
    "field": "moods",
    "schema": "Moods",
    "scope": "https://www.googleapis.com/auth/googlehealth.mindfulness.writeonly"
  },
  {
    "name": "nutrition-log",
    "field": "nutritionLog",
    "schema": "NutritionLog",
    "scope": "https://www.googleapis.com/auth/googlehealth.nutrition.writeonly"
  },
  {
    "name": "ovulation-test",
    "field": "ovulationTest",
    "schema": "OvulationTest",
    "scope": "https://www.googleapis.com/auth/googlehealth.reproductive_health.writeonly"
  },
  {
    "name": "sleep",
    "field": "sleep",
    "schema": "Sleep",
    "scope": "https://www.googleapis.com/auth/googlehealth.sleep.writeonly"
  },
  {
    "name": "symptoms",
    "field": "symptoms",
    "schema": "Symptoms",
    "scope": "https://www.googleapis.com/auth/googlehealth.logged_symptoms.writeonly"
  },
  {
    "name": "weight",
    "field": "weight",
    "schema": "Weight",
    "scope": "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.writeonly"
  }
] as const;

export const writeDefinitions = {
  "BodyFat": {
    "type": "object",
    "properties": {
      "sampleTime": {
        "$ref": "ObservationSampleTime",
        "description": "Required. The time at which body fat was measured."
      },
      "percentage": {
        "type": "number",
        "format": "double",
        "description": "Required. Body fat percentage. Must be in the range `[0, 100]`."
      }
    },
    "required": [
      "sampleTime",
      "percentage"
    ]
  },
  "ObservationSampleTime": {
    "type": "object",
    "properties": {
      "utcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. The offset of the user's local time during the observation relative to the Coordinated Universal Time (UTC)."
      },
      "physicalTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. The time of the observation."
      }
    },
    "required": [
      "utcOffset",
      "physicalTime"
    ]
  },
  "Exercise": {
    "type": "object",
    "properties": {
      "exerciseMetadata": {
        "$ref": "ExerciseMetadata",
        "description": "Optional. Additional exercise metadata."
      },
      "exerciseType": {
        "type": "string",
        "enum": [
          "EXERCISE_TYPE_UNSPECIFIED",
          "AEROBIC_WORKOUT",
          "ARCHERY",
          "ASSAULT_BIKE",
          "BACKPACKING",
          "BADMINTON",
          "BALLET",
          "BALLROOM_DANCE",
          "BARRE_CLASS",
          "BASEBALL",
          "BASKETBALL",
          "BIKING",
          "BILLIARDS",
          "BODY_WEIGHT",
          "BOOTCAMP",
          "BOWLING",
          "BOXING",
          "BREAKDANCING",
          "CALISTHENICS",
          "CANOEING",
          "CARDIO_SCULPT",
          "CARDIO_WORKOUT",
          "CARPENTRY",
          "CHEERLEADING",
          "CIRCUIT_TRAINING",
          "CLEANING",
          "CLIMBING",
          "CORE_TRAINING",
          "CRICKET",
          "CROQUET",
          "CROSS_COUNTRY_SKI",
          "CROSS_TRAINING",
          "CROSSFIT",
          "CURLING",
          "DANCING",
          "DIVING",
          "ELECTRIC_BIKE",
          "ELECTRIC_SCOOTER",
          "ELLIPTICAL",
          "EQUESTRIAN_SPORTS",
          "EXERCISE_CLASS",
          "FENCING",
          "FIELD_HOCKEY",
          "FISHING",
          "FITNESS_GAMING",
          "FOILING",
          "FOOTBALL_AMERICAN",
          "FOOTBALL_AUSTRALIAN",
          "FREE_WEIGHTS",
          "FRISBEE_PLAYING_GENERAL",
          "FUNCTIONAL_STRENGTH_TRAINING",
          "GARDENING",
          "GOLF",
          "GYMNASTICS",
          "HANDBALL",
          "HAND_CYCLING",
          "HIIT",
          "HIKING",
          "HIP_HOP",
          "HOCKEY",
          "HOEING",
          "HOUSEHOLD_CHORES",
          "HUNTING",
          "ICE_SKATING",
          "INCLINE_RUN",
          "INCLINE_WALK",
          "INDOOR_CLIMBING",
          "INTERVAL_WORKOUT",
          "JAZZ_DANCE",
          "JIU_JITSU",
          "JUMPING_ROPE",
          "KARATE",
          "KAYAKING",
          "KICKBOXING",
          "KITESURFING",
          "LACROSSE",
          "MARTIAL_ARTS",
          "MEDITATE",
          "MODERN_DANCE",
          "MOTOCROSS",
          "MOTORCYCLE",
          "MOUNTAIN_BIKE",
          "MOWING_LAWN",
          "MUAY_THAI",
          "MULTISPORT",
          "MUSICAL_PERFORMANCE",
          "NORDIC_WALKING",
          "ORIENTEERING",
          "OTHER",
          "OUTDOOR_BIKE",
          "OUTDOOR_WORKOUT",
          "PADDLEBOARDING",
          "PADEL",
          "PAINTING",
          "PARAGLIDING",
          "PARKOUR",
          "PICKELBALL",
          "PILATES",
          "POLO",
          "POWERLIFTING",
          "POWER_WALKING",
          "RACKET_SPORTS",
          "RACQUETBALL",
          "RESISTANCE_BANDS",
          "ROCK_CLIMBING",
          "ROLLERBLADING",
          "ROLLER_SKATING",
          "ROWING",
          "ROWING_MACHINE",
          "RUCKING",
          "RUGBY",
          "RUNNING",
          "SAILING",
          "SCOOTERING",
          "SCUBA_DIVING",
          "SHOOTING",
          "SHOVELING",
          "SKATEBOARDING",
          "SKATING",
          "SKIING",
          "SKYDIVING",
          "SNORKELING",
          "SNOWBOARDING",
          "SNOWMOBILING",
          "SNOWSHOEING",
          "SNOW_SPORT",
          "SOCCER",
          "SOFTBALL",
          "SPEED_SKATING",
          "SPINNING",
          "SPORT",
          "SQUASH",
          "STAIRCLIMBER",
          "STATIONARY_BIKE",
          "STEP_TRAINING",
          "STRENGTH_TRAINING",
          "STRETCHING",
          "STROLLER_WALK",
          "SURFING",
          "SWIMMING",
          "SWIMMING_OPEN_WATER",
          "SWIMMING_POOL",
          "SYNCHRONIZED_SWIMMING",
          "TABATA_WORKOUT",
          "TABLE_TENNIS",
          "TAEKWONDO",
          "TAI_CHI",
          "TANGO",
          "TENNIS",
          "TRACK_AND_FIELD",
          "TRAIL_RUN",
          "TRAMPOLINE",
          "TREADMILL",
          "TREADMILL_WALK",
          "TRX",
          "ULTIMATE_FRISBEE",
          "UNICYCLING",
          "VOLLEYBALL",
          "VOLLEYBALL_BEACH",
          "WAKEBOARDING",
          "WALKING",
          "WALK_WITH_WEIGHTS",
          "WATER_AEROBICS",
          "WATER_JOGGING",
          "WATER_POLO",
          "WATER_SKIING",
          "WATER_SPORT",
          "WATER_VOLLEYBALL",
          "WEEDING",
          "WEIGHTLIFTING",
          "WEIGHT_MACHINES",
          "WEIGHTS",
          "WHEELCHAIR",
          "WINDSURFING",
          "WORKOUT",
          "WRESTLING",
          "YOGA",
          "YOGA_BIKRAM",
          "YOGA_HATHA",
          "YOGA_POWER",
          "YOGA_VINYASA",
          "ZUMBA"
        ],
        "description": "Required. The type of activity performed during an exercise."
      },
      "exerciseEvents": {
        "type": "array",
        "description": "Optional. Exercise events that happen during an exercise, such as pause & restarts.",
        "items": {
          "$ref": "ExerciseEvent"
        }
      },
      "metricsSummary": {
        "$ref": "MetricsSummary",
        "description": "Required. Summary metrics for this exercise ( )"
      },
      "activeDuration": {
        "type": "string",
        "format": "google-duration",
        "description": "Optional. Duration excluding pauses."
      },
      "notes": {
        "type": "string",
        "description": "Optional. Standard free-form notes captured at manual logging."
      },
      "splits": {
        "type": "array",
        "description": "Optional. The default split is 1 km or 1 mile. - if the movement distance is less than the default, then there are no splits - if the movement distance is greater than or equal to the default, then we have splits",
        "items": {
          "$ref": "SplitSummary"
        }
      },
      "displayName": {
        "type": "string",
        "description": "Required. The localized, human-readable name of the exercise. For all exercise types other than `OTHER`, the system ignores client input and overrides this field with a generated name based on `exercise_type` (e.g., \"Walking\" for `WALKING`). If `exercise_type` is `OTHER`, this field can contain the user's custom, free-form display name."
      },
      "splitSummaries": {
        "type": "array",
        "description": "Optional. Laps or splits recorded within an exercise. Laps could be split based on distance or other criteria (duration, etc.) Laps should not be overlapping with each other.",
        "items": {
          "$ref": "SplitSummary"
        }
      },
      "interval": {
        "$ref": "SessionTimeInterval",
        "description": "Required. Observed exercise interval"
      }
    },
    "required": [
      "exerciseType",
      "metricsSummary",
      "displayName",
      "interval"
    ]
  },
  "ExerciseMetadata": {
    "type": "object",
    "properties": {
      "hasGps": {
        "type": "boolean",
        "description": "Optional. Whether the exercise had GPS tracking."
      },
      "poolLengthMillimeters": {
        "type": "string",
        "format": "int64",
        "description": "Optional. Pool length in millimeters. Only present in the swimming exercises."
      }
    },
    "required": []
  },
  "ExerciseEvent": {
    "type": "object",
    "properties": {
      "exerciseEventType": {
        "type": "string",
        "enum": [
          "EXERCISE_EVENT_TYPE_UNSPECIFIED",
          "START",
          "STOP",
          "PAUSE",
          "RESUME",
          "AUTO_PAUSE",
          "AUTO_RESUME"
        ],
        "description": "Required. The type of the event, such as start, stop, pause, resume."
      },
      "eventTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. Exercise event time"
      },
      "eventUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. Exercise event time offset from UTC"
      }
    },
    "required": [
      "exerciseEventType",
      "eventTime",
      "eventUtcOffset"
    ]
  },
  "MetricsSummary": {
    "type": "object",
    "properties": {
      "runVo2Max": {
        "type": "number",
        "format": "double",
        "description": "Optional. Run VO2 max value for the exercise. Only present in the running exercises at the top level as in the summary of the whole exercise."
      },
      "elevationGainMillimeters": {
        "type": "number",
        "format": "double",
        "description": "Optional. Total elevation gain during the exercise."
      },
      "steps": {
        "type": "string",
        "format": "int64",
        "description": "Optional. Total steps taken during the exercise."
      },
      "caloriesKcal": {
        "type": "number",
        "format": "double",
        "description": "Optional. Total calories burned by the user during the exercise."
      },
      "distanceMillimeters": {
        "type": "number",
        "format": "double",
        "description": "Optional. Total distance covered by the user during the exercise."
      },
      "totalSwimLengths": {
        "type": "number",
        "format": "double",
        "description": "Optional. Number of full pool lengths completed during the exercise. Only present in the swimming exercises at the top level as in the summary of the whole exercise."
      },
      "averagePaceSecondsPerMeter": {
        "type": "number",
        "format": "double",
        "description": "Optional. Average pace in seconds per meter."
      },
      "averageHeartRateBeatsPerMinute": {
        "type": "string",
        "format": "int64",
        "description": "Optional. Average heart rate during the exercise."
      },
      "heartRateZoneDurations": {
        "$ref": "TimeInHeartRateZones",
        "description": "Optional. Time spent in each heart rate zone."
      },
      "activeZoneMinutes": {
        "type": "string",
        "format": "int64",
        "description": "Optional. Total active zone minutes for the exercise."
      },
      "mobilityMetrics": {
        "$ref": "MobilityMetrics",
        "description": "Optional. Mobility workouts specific metrics. Only present in the advanced running exercises."
      },
      "averageSpeedMillimetersPerSecond": {
        "type": "number",
        "format": "double",
        "description": "Optional. Average speed in millimeters per second."
      }
    },
    "required": []
  },
  "TimeInHeartRateZones": {
    "type": "object",
    "properties": {
      "lightTime": {
        "type": "string",
        "format": "google-duration",
        "description": "Optional. Time spent in light heart rate zone."
      },
      "moderateTime": {
        "type": "string",
        "format": "google-duration",
        "description": "Optional. Time spent in moderate heart rate zone."
      },
      "vigorousTime": {
        "type": "string",
        "format": "google-duration",
        "description": "Optional. Time spent in vigorous heart rate zone."
      },
      "peakTime": {
        "type": "string",
        "format": "google-duration",
        "description": "Optional. Time spent in peak heart rate zone."
      }
    },
    "required": []
  },
  "MobilityMetrics": {
    "type": "object",
    "properties": {
      "avgVerticalRatio": {
        "type": "number",
        "format": "double",
        "description": "Optional. Vertical oscillation/stride length between [5.0, 11.0]."
      },
      "avgVerticalOscillationMillimeters": {
        "type": "string",
        "format": "int64",
        "description": "Optional. Distance off the ground your center of mass moves with each stride while running"
      },
      "avgGroundContactTimeDuration": {
        "type": "string",
        "format": "google-duration",
        "description": "Optional. The ground contact time for a particular stride is the amount of time for which the foot was in contact with the ground on that stride"
      },
      "avgCadenceStepsPerMinute": {
        "type": "number",
        "format": "double",
        "description": "Optional. Cadence is a measure of the frequency of your foot strikes. Steps / min in real time during workout."
      },
      "avgStrideLengthMillimeters": {
        "type": "string",
        "format": "int64",
        "description": "Optional. Stride length is a measure of the distance covered by a single stride"
      }
    },
    "required": []
  },
  "SplitSummary": {
    "type": "object",
    "properties": {
      "endTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. Lap end time"
      },
      "splitType": {
        "type": "string",
        "enum": [
          "SPLIT_TYPE_UNSPECIFIED",
          "MANUAL",
          "DURATION",
          "DISTANCE",
          "CALORIES"
        ],
        "description": "Required. Method used to split the exercise laps. Users may manually mark the lap as complete even if the tracking is automatic."
      },
      "startUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. Lap start time offset from UTC"
      },
      "metricsSummary": {
        "$ref": "MetricsSummary",
        "description": "Required. Summary metrics for this split."
      },
      "startTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. Lap start time"
      },
      "endUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. Lap end time offset from UTC"
      }
    },
    "required": [
      "endTime",
      "splitType",
      "startUtcOffset",
      "metricsSummary",
      "startTime",
      "endUtcOffset"
    ]
  },
  "SessionTimeInterval": {
    "type": "object",
    "properties": {
      "endUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. The offset of the user's local time at the end of the session relative to the Coordinated Universal Time (UTC)."
      },
      "startUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. The offset of the user's local time at the start of the session relative to the Coordinated Universal Time (UTC)."
      },
      "endTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. The end time of the observed session."
      },
      "startTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. The start time of the observed session."
      }
    },
    "required": [
      "endUtcOffset",
      "startUtcOffset",
      "endTime",
      "startTime"
    ]
  },
  "Height": {
    "type": "object",
    "properties": {
      "sampleTime": {
        "$ref": "ObservationSampleTime",
        "description": "Required. The time at which the height was recorded."
      },
      "heightMillimeters": {
        "type": "string",
        "format": "int64",
        "description": "Required. Height of the user in millimeters. Must be in the range `[0, 3000]`."
      }
    },
    "required": [
      "sampleTime",
      "heightMillimeters"
    ]
  },
  "HydrationLog": {
    "type": "object",
    "properties": {
      "interval": {
        "$ref": "SessionTimeInterval",
        "description": "Required. Observed interval."
      },
      "amountConsumed": {
        "$ref": "VolumeQuantity",
        "description": "Required. Amount of liquid (ex. water) consumed."
      }
    },
    "required": [
      "interval",
      "amountConsumed"
    ]
  },
  "VolumeQuantity": {
    "type": "object",
    "properties": {
      "milliliters": {
        "type": "number",
        "format": "double",
        "description": "Required. Value representing the volume in milliliters. Must be in the range `[0, 100000]`."
      },
      "userProvidedUnit": {
        "type": "string",
        "enum": [
          "VOLUME_UNIT_UNSPECIFIED",
          "CUP_IMPERIAL",
          "CUP_US",
          "FLUID_OUNCE_IMPERIAL",
          "FLUID_OUNCE_US",
          "LITER",
          "MILLILITER",
          "PINT_IMPERIAL",
          "PINT_US"
        ],
        "description": "Optional. Value representing the user provided unit, used only for user-facing input and display purposes. In the API format, all volume quantities are converted to milliliters."
      }
    },
    "required": [
      "milliliters"
    ]
  },
  "MenstrualPeriod": {
    "type": "object",
    "properties": {
      "notes": {
        "type": "string",
        "description": "Optional. Standard free-form notes captured at manual logging."
      },
      "interval": {
        "$ref": "ObservationTimeInterval",
        "description": "Required. Observed interval."
      }
    },
    "required": [
      "interval"
    ]
  },
  "ObservationTimeInterval": {
    "type": "object",
    "properties": {
      "endTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. Observed interval end time."
      },
      "endUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. The offset of the user's local time at the end of the observation relative to the Coordinated Universal Time (UTC)."
      },
      "startUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. The offset of the user's local time at the start of the observation relative to the Coordinated Universal Time (UTC)."
      },
      "startTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. Observed interval start time."
      }
    },
    "required": [
      "endTime",
      "endUtcOffset",
      "startUtcOffset",
      "startTime"
    ]
  },
  "Moods": {
    "type": "object",
    "properties": {
      "sampleTime": {
        "$ref": "ObservationSampleTime",
        "description": "Required. The time at which moods were measured."
      },
      "valences": {
        "type": "array",
        "description": "Optional. The valences.",
        "items": {
          "type": "string",
          "enum": [
            "VALENCE_UNSPECIFIED",
            "UNPLEASANT",
            "BASELINE",
            "PLEASANT"
          ]
        }
      },
      "moods": {
        "type": "array",
        "description": "Required. The moods logged.",
        "items": {
          "type": "string",
          "enum": [
            "MOOD_UNSPECIFIED",
            "AMAZED",
            "AMUSED",
            "ANGRY",
            "ANNOYED",
            "ANXIOUS",
            "HAPPY",
            "CONTENT",
            "SAD",
            "WORRIED",
            "FRUSTRATED",
            "EXCITED",
            "CALM",
            "STRESSED",
            "ASHAMED",
            "BRAVE",
            "CONFIDENT",
            "DISAPPOINTED",
            "DISCOURAGED",
            "DISGUSTED",
            "DRAINED",
            "EMBARRASSED",
            "GRATEFUL",
            "GUILTY",
            "HOPEFUL",
            "HOPELESS",
            "INDIFFERENT",
            "IRRITATED",
            "JEALOUS",
            "JOYFUL",
            "LONELY",
            "OVERWHELMED",
            "PASSIONATE",
            "PEACEFUL",
            "PROUD",
            "RELIEVED",
            "SATISFIED",
            "SCARED",
            "SURPRISED",
            "ENERGIZED",
            "FATIGUED",
            "VERY_CALM",
            "VERY_STRESSED",
            "NEUTRAL",
            "AFRAID",
            "HURTING",
            "BORED",
            "BITTER",
            "ENVIOUS",
            "CONFUSED",
            "CURIOUS",
            "AWESTRUCK",
            "INSPIRED",
            "LONGING",
            "ACCOMPLISHED",
            "LOVING",
            "COMPASSIONATE",
            "DEPRESSED",
            "GOOD",
            "LOW_ENERGY",
            "OBSESSIVE_THOUGHTS",
            "PANIC",
            "PLAYFUL",
            "PLEASED",
            "SENSITIVE",
            "SLEEPY",
            "SWINGS",
            "UNHAPPY",
            "VERY_SELF_CRITICAL"
          ]
        }
      }
    },
    "required": [
      "sampleTime",
      "moods"
    ]
  },
  "NutritionLog": {
    "type": "object",
    "properties": {
      "mealType": {
        "type": "string",
        "enum": [
          "MEAL_TYPE_UNSPECIFIED",
          "BEFORE_BREAKFAST",
          "BREAKFAST",
          "BEFORE_LUNCH",
          "LUNCH",
          "BEFORE_DINNER",
          "DINNER",
          "AFTER_DINNER",
          "SNACK",
          "ANYTIME"
        ],
        "description": "Optional. The meal category. One of `BREAKFAST`, `LUNCH`, `DINNER`, or `SNACK`."
      },
      "foodDisplayName": {
        "type": "string",
        "description": "The display name of the food. For identified food logs, this is populated automatically from the referenced food."
      },
      "energyFromFat": {
        "$ref": "EnergyQuantity",
        "description": "Optional. The energy from fat, measured in kilocalories (`kcal`)."
      },
      "totalCarbohydrate": {
        "$ref": "WeightQuantity",
        "description": "Optional. The total carbohydrate content, measured in grams."
      },
      "totalFat": {
        "$ref": "WeightQuantity",
        "description": "Optional. The total fat content, measured in grams."
      },
      "interval": {
        "$ref": "SessionTimeInterval",
        "description": "Required. The time window when the food was logged."
      },
      "serving": {
        "$ref": "Serving",
        "description": "Optional. The serving information for the logged food."
      },
      "nutrients": {
        "type": "array",
        "description": "Optional. An array of individual nutrient values for the nutrition log.",
        "items": {
          "$ref": "NutrientQuantity"
        }
      },
      "energy": {
        "$ref": "EnergyQuantity",
        "description": "Optional. The total energy of the food, measured in kilocalories (`kcal`)."
      },
      "food": {
        "type": "string",
        "description": "Optional. The resource name of the Food item. Required when creating a nutrition log from an identified food. For anonymous food logs, use the `food_display_name` field instead."
      }
    },
    "required": [
      "interval"
    ]
  },
  "EnergyQuantity": {
    "type": "object",
    "properties": {
      "kcal": {
        "type": "number",
        "format": "double",
        "description": "Required. The energy value in kilocalories. Must be in the range `[0, 100000]`."
      },
      "userProvidedUnit": {
        "type": "string",
        "enum": [
          "ENERGY_UNIT_UNSPECIFIED",
          "JOULE",
          "KILOJOULE",
          "KILOCALORIE",
          "SMALL_CALORIE",
          "CALORIE"
        ],
        "description": "Optional. Value representing the user provided unit."
      }
    },
    "required": [
      "kcal"
    ]
  },
  "WeightQuantity": {
    "type": "object",
    "properties": {
      "userProvidedUnit": {
        "type": "string",
        "enum": [
          "WEIGHT_UNIT_UNSPECIFIED",
          "GRAM",
          "KILOGRAM",
          "OUNCE",
          "POUND",
          "STONE",
          "MILLIGRAM",
          "MICROGRAM",
          "NANOGRAM"
        ],
        "description": "Optional. Value representing the user provided unit."
      },
      "grams": {
        "type": "number",
        "format": "double",
        "description": "Required. The weight value in grams. Must be in the range `[0, 100000]`."
      }
    },
    "required": [
      "grams"
    ]
  },
  "Serving": {
    "type": "object",
    "properties": {
      "amount": {
        "type": "number",
        "format": "double",
        "description": "Optional. The number of servings."
      },
      "foodMeasurementUnit": {
        "type": "string",
        "description": "Required. Food measurement unit"
      }
    },
    "required": [
      "foodMeasurementUnit"
    ]
  },
  "NutrientQuantity": {
    "type": "object",
    "properties": {
      "quantity": {
        "$ref": "WeightQuantity",
        "description": "Required. The quantity of the nutrient, measured in grams."
      },
      "nutrient": {
        "type": "string",
        "enum": [
          "NUTRIENT_UNSPECIFIED",
          "BIOTIN",
          "CAFFEINE",
          "CALCIUM",
          "CHLORIDE",
          "CARBOHYDRATES",
          "CHOLESTEROL",
          "CHROMIUM",
          "COPPER",
          "DIETARY_FIBER",
          "FOLIC_ACID",
          "IODINE",
          "IRON",
          "MAGNESIUM",
          "MANGANESE",
          "MOLYBDENUM",
          "MONOUNSATURATED_FAT",
          "NIACIN",
          "PANTOTHENIC_ACID",
          "PHOSPHORUS",
          "POLYUNSATURATED_FAT",
          "POTASSIUM",
          "PROTEIN",
          "RIBOFLAVIN",
          "SATURATED_FAT",
          "SELENIUM",
          "SODIUM",
          "SUGAR",
          "THIAMIN",
          "TRANS_FAT",
          "UNSATURATED_FAT",
          "VITAMIN_A",
          "VITAMIN_B12",
          "VITAMIN_B6",
          "VITAMIN_C",
          "VITAMIN_D",
          "VITAMIN_E",
          "VITAMIN_K",
          "ZINC",
          "FOLATE"
        ],
        "description": "Required. The nutrient type."
      }
    },
    "required": [
      "quantity",
      "nutrient"
    ]
  },
  "OvulationTest": {
    "type": "object",
    "properties": {
      "sampleTime": {
        "$ref": "ObservationSampleTime",
        "description": "Required. The time at which ovulation test was measured."
      },
      "result": {
        "type": "string",
        "enum": [
          "OVULATION_TEST_RESULT_UNSPECIFIED",
          "NEGATIVE",
          "LUTEINIZING_HORMONE_SURGE",
          "ESTROGEN_SURGE",
          "POSITIVE",
          "INDETERMINATE"
        ],
        "description": "Required. The result of the ovulation test."
      }
    },
    "required": [
      "sampleTime",
      "result"
    ]
  },
  "Sleep": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": [
          "SLEEP_TYPE_UNSPECIFIED",
          "CLASSIC",
          "STAGES"
        ],
        "description": "Optional. SleepType: classic or stages."
      },
      "interval": {
        "$ref": "SessionTimeInterval",
        "description": "Required. Observed sleep interval."
      },
      "metadata": {
        "$ref": "SleepMetadata",
        "description": "Optional. Sleep metadata: `processed`, `main_sleep`, `manually_edited`, and `stages_status`."
      },
      "outOfBedSegments": {
        "type": "array",
        "description": "Optional. “Out of bed” segments that can overlap with sleep stages.",
        "items": {
          "$ref": "OutOfBedSegment"
        }
      },
      "stages": {
        "type": "array",
        "description": "Optional. List of non-overlapping contiguous sleep stage segments that cover the sleep period.",
        "items": {
          "$ref": "SleepStage"
        }
      }
    },
    "required": [
      "interval"
    ]
  },
  "SleepMetadata": {
    "type": "object",
    "properties": {
      "externalId": {
        "type": "string",
        "description": "Optional. Sleep identifier relevant in the context of the data source."
      }
    },
    "required": []
  },
  "OutOfBedSegment": {
    "type": "object",
    "properties": {
      "endTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. Segment end time."
      },
      "endUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. The offset of the user's local time at the end of the segment relative to the Coordinated Universal Time (UTC)."
      },
      "startTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. Segment tart time."
      },
      "startUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. The offset of the user's local time at the start of the segment relative to the Coordinated Universal Time (UTC)."
      }
    },
    "required": [
      "endTime",
      "endUtcOffset",
      "startTime",
      "startUtcOffset"
    ]
  },
  "SleepStage": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": [
          "SLEEP_STAGE_TYPE_UNSPECIFIED",
          "AWAKE",
          "LIGHT",
          "DEEP",
          "REM",
          "ASLEEP",
          "RESTLESS"
        ],
        "description": "Required. Sleep stage type: AWAKE, DEEP, REM, LIGHT etc."
      },
      "startUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. The offset of the user's local time at the start of the sleep stage relative to the Coordinated Universal Time (UTC)."
      },
      "endTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. Sleep stage end time."
      },
      "endUtcOffset": {
        "type": "string",
        "format": "google-duration",
        "description": "Required. The offset of the user's local time at the end of the sleep stage relative to the Coordinated Universal Time (UTC)."
      },
      "startTime": {
        "type": "string",
        "format": "google-datetime",
        "description": "Required. Sleep stage start time."
      }
    },
    "required": [
      "type",
      "startUtcOffset",
      "endTime",
      "endUtcOffset",
      "startTime"
    ]
  },
  "Symptoms": {
    "type": "object",
    "properties": {
      "sampleTime": {
        "$ref": "ObservationSampleTime",
        "description": "Required. Time when the symptoms were logged."
      },
      "symptoms": {
        "type": "array",
        "description": "Required. List of symptoms experienced.",
        "items": {
          "type": "string",
          "enum": [
            "SYMPTOM_VALUE_UNSPECIFIED",
            "CRAMPS",
            "HEADACHE",
            "TENDER_BREASTS",
            "ACNE",
            "SICK",
            "BLOATED",
            "HOT_FLASHES",
            "PMS",
            "COUGH",
            "FEVER",
            "DIFFICULTY_BREATHING",
            "BACK_PAIN",
            "SHAKINESS",
            "HUNGER",
            "SWEATING",
            "ANXIETY",
            "THIRST",
            "FREQUENT_URINATION",
            "BLURRED_VISION",
            "OTHER",
            "SEX_DRIVE_HIGH",
            "SEX_DRIVE_MEDIUM",
            "SEX_DRIVE_LOW",
            "HEART_PALPITATIONS",
            "FAINTING",
            "CHEST_PAIN",
            "FATIGUE",
            "CONFUSION",
            "DIZZINESS",
            "ABDOMINAL_PAIN",
            "BLADDER_LEAKS",
            "BLEEDING_GUMS",
            "BRAIN_FOG",
            "BURNING_MOUTH",
            "CONSTIPATION",
            "CRAVINGS",
            "DECREASED_APPETITE",
            "DIARRHEA",
            "DRAWING_PAIN",
            "DRY_EYES",
            "DRY_HAIR",
            "DRY_SKIN",
            "EXHAUSTION",
            "FEEL_GOOD",
            "FOOD_AVERSIONS",
            "HAIR_LOSS",
            "HEARTBURN",
            "HYPERPIGMENTATION",
            "INCREASED_APPETITE",
            "INCREASED_APPETITE_V2",
            "INSOMNIA",
            "JOINT_PAIN",
            "LEG_CRAMPS",
            "MILKY_NIPPLE_DISCHARGE",
            "NAUSEA",
            "NIGHT_SWEATS",
            "NORMAL_DIGESTION",
            "NORMAL_STOOL",
            "PERINEUM_PAIN",
            "SLEEPINESS",
            "STRETCH_MARKS",
            "SWELLING",
            "VAGINAL_DRYNESS",
            "VAGINAL_ITCHING",
            "VOMITING"
          ]
        }
      }
    },
    "required": [
      "sampleTime",
      "symptoms"
    ]
  },
  "Weight": {
    "type": "object",
    "properties": {
      "sampleTime": {
        "$ref": "ObservationSampleTime",
        "description": "Required. The time at which the weight was measured"
      },
      "notes": {
        "type": "string",
        "description": "Optional. Standard free-form notes captured at manual logging."
      },
      "weightGrams": {
        "type": "number",
        "format": "double",
        "description": "Required. Weight of a user in grams. Must be in the range `[0, 1000000]`."
      }
    },
    "required": [
      "sampleTime",
      "weightGrams"
    ]
  },
  "Profile": {
    "type": "object",
    "properties": {
      "userConfiguredWalkingStrideLengthMm": {
        "type": "integer",
        "format": "int32",
        "description": "Optional. The user's user configured walking stride length, in millimeters. The user must consent to the following access scope to access this field: - `https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly`"
      },
      "userConfiguredRunningStrideLengthMm": {
        "type": "integer",
        "format": "int32",
        "description": "Optional. The user's user configured running stride length, in millimeters. The user must consent to the following access scope to access this field: - `https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly`"
      }
    },
    "required": []
  },
  "Settings": {
    "type": "object",
    "properties": {
      "waterUnit": {
        "type": "string",
        "enum": [
          "WATER_UNIT_UNSPECIFIED",
          "WATER_UNIT_ML",
          "WATER_UNIT_FL_OZ",
          "WATER_UNIT_CUP"
        ],
        "description": "Optional. The measurement unit defined in the user's account settings."
      },
      "temperatureUnit": {
        "type": "string",
        "enum": [
          "TEMPERATURE_UNIT_UNSPECIFIED",
          "TEMPERATURE_UNIT_CELSIUS",
          "TEMPERATURE_UNIT_FAHRENHEIT"
        ],
        "description": "Optional. The measurement unit defined in the user's account settings."
      },
      "swimUnit": {
        "type": "string",
        "enum": [
          "SWIM_UNIT_UNSPECIFIED",
          "SWIM_UNIT_METERS",
          "SWIM_UNIT_YARDS"
        ],
        "description": "Optional. The measurement unit defined in the user's account settings."
      },
      "glucoseUnit": {
        "type": "string",
        "enum": [
          "GLUCOSE_UNIT_UNSPECIFIED",
          "GLUCOSE_UNIT_MG_DL",
          "GLUCOSE_UNIT_MMOL_L"
        ],
        "description": "Optional. The measurement unit defined in the user's account settings."
      },
      "distanceUnit": {
        "type": "string",
        "enum": [
          "DISTANCE_UNIT_UNSPECIFIED",
          "DISTANCE_UNIT_MILES",
          "DISTANCE_UNIT_KILOMETERS"
        ],
        "description": "Optional. The measurement unit defined in the user's account settings."
      },
      "heightUnit": {
        "type": "string",
        "enum": [
          "HEIGHT_UNIT_UNSPECIFIED",
          "HEIGHT_UNIT_INCHES",
          "HEIGHT_UNIT_CENTIMETERS"
        ],
        "description": "Optional. The measurement unit defined in the user's account settings."
      },
      "weightUnit": {
        "type": "string",
        "enum": [
          "WEIGHT_UNIT_UNSPECIFIED",
          "WEIGHT_UNIT_POUNDS",
          "WEIGHT_UNIT_STONE",
          "WEIGHT_UNIT_KILOGRAMS"
        ],
        "description": "Optional. The measurement unit defined in the user's account settings."
      }
    },
    "required": []
  }
} as const;
