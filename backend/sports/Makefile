build:
	mkdir -p $(ARTIFACTS_DIR)
	cp -R $(LAMBDA_FILE) $(ARTIFACTS_DIR)/
	
	cp -R common/ $(ARTIFACTS_DIR)/
	
	python3 -m pip install -r common/requirements.txt -t $(ARTIFACTS_DIR)/

	rm -rf $(ARTIFACTS_DIR)/bin

build-GetAllSportsAchievementsFunction:
	$(MAKE) build LAMBDA_FILE=GetAllSportsAchievements/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-GetAllCountriesAchievementsFunction:
	$(MAKE) build LAMBDA_FILE=GetAllCountriesAchievements/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-GetAllMedalsPerContinentFunction:
	$(MAKE) build LAMBDA_FILE=GetAllMedalsPerContinent/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-GetAllMedalsPerSportsmanFunction:
	$(MAKE) build LAMBDA_FILE=GetAllMedalsPerSportsman/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-GetAllMedalsPerYearFunction:
	$(MAKE) build LAMBDA_FILE=GetAllMedalsPerYear/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)
