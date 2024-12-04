build:
	mkdir -p $(ARTIFACTS_DIR)
	cp -R $(LAMBDA_FILE) $(ARTIFACTS_DIR)/
	
	cp -R common/ $(ARTIFACTS_DIR)/
	
	python3 -m pip install -r common/requirements.txt -t $(ARTIFACTS_DIR)/

	rm -rf $(ARTIFACTS_DIR)/bin

build-AddSportsAchievementsFunction:
	$(MAKE) build LAMBDA_FILE=AddSportsAchievements/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-DeleteSportsAchievementsFunction:
	$(MAKE) build LAMBDA_FILE=DeleteSportsAchievements/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-UpdateSportsAchievementsFunction:
	$(MAKE) build LAMBDA_FILE=UpdateSportsAchievements/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-GetAllSportsAchievementsFunction:
	$(MAKE) build LAMBDA_FILE=GetAllSportsAchievements/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-GetSportsAchievementByIdFunction:
	$(MAKE) build LAMBDA_FILE=GetSportsAchievementById/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)