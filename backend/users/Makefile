build:
	mkdir -p $(ARTIFACTS_DIR)
	cp -R $(LAMBDA_FILE) $(ARTIFACTS_DIR)/
	
	cp -R common/ $(ARTIFACTS_DIR)/
	
	python3 -m pip install -r common/requirements.txt -t $(ARTIFACTS_DIR)/

	rm -rf $(ARTIFACTS_DIR)/bin

build-RegisterUserFunction:
	$(MAKE) build LAMBDA_FILE=RegisterUser/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-LoginUserFunction:
	$(MAKE) build LAMBDA_FILE=LoginUser/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-ThirdPartyLoginRequestFunction:
	$(MAKE) build LAMBDA_FILE=ThirdPartyRequestLogin/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-ThirdPartyLoginValidateFunction:
	$(MAKE) build LAMBDA_FILE=ThirdPartyConfirmLogin/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)

build-DeleteUserFunction:
	$(MAKE) build LAMBDA_FILE=DeleteUser/*.py ARTIFACTS_DIR=$(ARTIFACTS_DIR)