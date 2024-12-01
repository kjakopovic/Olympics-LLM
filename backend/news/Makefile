build:
	mkdir -p $(ARTIFACTS_DIR)
	cp -R $(LAMBDA_FILE) $(ARTIFACTS_DIR)/
	
	cp -R common/ $(ARTIFACTS_DIR)/
	
	python3 -m pip install -r common/requirements.txt -t $(ARTIFACTS_DIR)/

	rm -rf $(ARTIFACTS_DIR)/bin

build-CreateNewsFunction:
	$(MAKE) build LAMBDA_FILE=CreateNews/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-DeleteNewsFunction:
	$(MAKE) build LAMBDA_FILE=DeleteNews/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-UpdateNewsFunction:
	$(MAKE) build LAMBDA_FILE=UpdateNews/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-GetAllNewsFunction:
	$(MAKE) build LAMBDA_FILE=GetAllNews/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-GetNewsByIdFunction:
	$(MAKE) build LAMBDA_FILE=GetNewsById/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)