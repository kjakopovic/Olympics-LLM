build-lambda-common:
	cd $(WORKING_DIR)
	npm install
	rm -rf dist
	printf "{\"extends\": \"./tsconfig.json\", \"include\": [\"${HANDLER}\"] }" > tsconfig-only-handler.json
	npm run build -- --build tsconfig-only-handler.json
	cp -r dist "$(ARTIFACTS_DIR)/"
	cp docs.yaml $(ARTIFACTS_DIR)/

build-RuntimeDependenciesLayer:
	cd docs
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	cp package.json package-lock.json "$(ARTIFACTS_DIR)/nodejs/"
	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/"
	rm "$(ARTIFACTS_DIR)/nodejs/package.json"

build-SwaggerDocsFunction:
	$(MAKE) HANDLER=app.ts WORKING_DIR=docs build-lambda-common
