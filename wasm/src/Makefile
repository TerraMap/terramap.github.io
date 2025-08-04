# Config values

CXXFLAGS := -Wall -Wextra -pedantic -Werror -std=c++20 -O2
LDFLAGS := -O2

SRCS := Reader.cpp WorldLoader.cpp
OUT := terramap

BUILD_DIR := build


# Build rules.

CPPFLAGS := -Isrc

OBJS := $(SRCS:%=$(BUILD_DIR)/%.o)

$(BUILD_DIR)/$(OUT): $(OBJS)
	$(CXX) $(OBJS) -o $@ $(LDFLAGS)

$(BUILD_DIR)/%.cpp.o: %.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $< -o $@

clean:
	rm -r $(BUILD_DIR)

format:
	clang-format -i $(SRCS)

.PHONY: clean format
