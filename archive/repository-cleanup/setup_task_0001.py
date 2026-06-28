import os
import json

def write_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + "\n")

# 1. Root configs
write_file('pnpm-workspace.yaml', "packages:\n  - 'apps/*'\n  - 'packages/*'")

write_file('turbo.json', json.dumps({
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": False
    }
  }
}, indent=2))

root_pkg = {
  "name": "data-seeder",
  "private": True,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "latest",
    "prettier": "latest",
    "eslint": "latest",
    "@types/node": "latest"
  }
}
write_file('package.json', json.dumps(root_pkg, indent=2))

write_file('tsconfig.base.json', json.dumps({
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "declaration": True,
    "sourceMap": True,
    "strict": True,
    "esModuleInterop": True,
    "skipLibCheck": True,
    "forceConsistentCasingInFileNames": True
  }
}, indent=2))

write_file('.prettierrc', '{"semi": true, "singleQuote": true}')

# Base package JSON generator
def get_pkg_json(name, deps=None, devDeps=None):
    if deps is None: deps = {}
    if devDeps is None: devDeps = {}
    return {
        "name": f"@seeder/{name}",
        "version": "0.0.1",
        "private": True,
        "main": "dist/index.js",
        "types": "dist/index.d.ts",
        "scripts": {
            "build": "tsc",
            "lint": "eslint src/",
            "test": "echo 'No tests yet'"
        },
        "dependencies": deps,
        "devDependencies": {
            "typescript": "latest",
            **devDeps
        }
    }

# 2. Packages
packages = {
    "contracts": {"deps": {"zod": "latest"}},
    "shared": {"deps": {}},
    "core": {"deps": {"@opentelemetry/api": "latest", "@opentelemetry/sdk-node": "latest", "pino": "latest"}},
    "database": {"deps": {"drizzle-orm": "latest", "postgres": "latest"}, "devDeps": {"drizzle-kit": "latest"}},
    "browser-runtime": {"deps": {"playwright": "latest", "@seeder/core": "workspace:*"}},
    "ai": {"deps": {"groq-sdk": "latest", "@seeder/core": "workspace:*"}},
    "graph": {"deps": {"@seeder/contracts": "workspace:*", "@seeder/core": "workspace:*"}},
    "testing": {"deps": {"@seeder/core": "workspace:*"}}
}

for pkg_name, config in packages.items():
    write_file(f'packages/{pkg_name}/package.json', json.dumps(get_pkg_json(pkg_name, config.get("deps"), config.get("devDeps")), indent=2))
    write_file(f'packages/{pkg_name}/tsconfig.json', json.dumps({
        "extends": "../../tsconfig.base.json",
        "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
        "include": ["src/**/*"]
    }, indent=2))
    write_file(f'packages/{pkg_name}/src/index.ts', f"export const name = '@seeder/{pkg_name}';\n")

# 3. Apps
apps = {
    "seeder": {"deps": {
        "@seeder/core": "workspace:*",
        "@seeder/contracts": "workspace:*",
        "@seeder/ai": "workspace:*",
        "@seeder/browser-runtime": "workspace:*",
        "@seeder/database": "workspace:*",
        "@seeder/graph": "workspace:*"
    }},
    "test-app": {"deps": {}}
}

for app_name, config in apps.items():
    write_file(f'apps/{app_name}/package.json', json.dumps(get_pkg_json(app_name, config.get("deps"), config.get("devDeps")), indent=2))
    write_file(f'apps/{app_name}/tsconfig.json', json.dumps({
        "extends": "../../tsconfig.base.json",
        "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
        "include": ["src/**/*"]
    }, indent=2))
    write_file(f'apps/{app_name}/src/index.ts', f"export const name = '@seeder/{app_name}';\n")

