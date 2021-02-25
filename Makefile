.PHONY: batch
batch:
	deno run --allow-net --allow-write --allow-read -c tsconfig.json batch.ts
serve:
	deno run --allow-net --allow-write --allow-read -c tsconfig.json server.ts
test:
	deno test -c tsconfig.json
update:
	deno cache --reload ./deps.ts ./test_deps.ts
setup:
	deno run --allow-write --allow-read setup.ts
