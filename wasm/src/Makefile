# Config values

CXXFLAGS := -Wall -Wextra -pedantic -Werror -Wno-dollar-in-identifier-extension \
            -std=c++20 -O2
LDFLAGS := -lembind                   \
           -sENVIRONMENT=worker       \
           -sALLOW_MEMORY_GROWTH=1    \
           -sSTACK_SIZE=16MB          \
           --extern-pre-js header.js  \
           --pre-js pre.js            \
           --extern-post-js worker.js \
           -O2 --closure 1

SRCS := main.cpp Reader.cpp TileColor.cpp World.cpp WorldLoader.cpp
OUT := terramap

BUILD_DIR := build


# Build rules.

CPPFLAGS := -Isrc

OBJS := $(SRCS:%=$(BUILD_DIR)/%.o)

$(BUILD_DIR)/$(OUT).js: $(OBJS) header.js pre.js worker.js
	$(CXX) $(OBJS) -o $@ $(LDFLAGS)

$(BUILD_DIR)/%.cpp.o: %.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $< -o $@

$(BUILD_DIR)/$(OUT): $(OBJS)
	$(CXX) $(OBJS) -o $@

cli: $(BUILD_DIR)/$(OUT)

clean:
	rm -r $(BUILD_DIR)

format:
	clang-format -i $(SRCS)

.PHONY: cli clean format
